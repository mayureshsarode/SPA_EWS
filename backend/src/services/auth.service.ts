import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "spa-ews-dev-secret";
const TOKEN_EXPIRY = "7d";

interface LoginInput {
  email: string;
  password: string;
  role: string; // The role tab the user selected on the frontend
}

/**
 * Validates credentials and returns a signed JWT + user profile.
 */
export async function loginUser({ email, password, role }: LoginInput) {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      department: true,
      studentProfile: true,
      facultyProfile: { select: { adminRole: true } },
    },
  });

  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  // 2. Validate that the user's actual role matches the selected tab
  const roleMap: Record<string, string[]> = {
    student: ["STUDENT"],
    faculty: ["FACULTY"],
    admin: ["ADMIN", "SUPER_ADMIN"],
  };

  const allowedDbRoles = roleMap[role.toLowerCase()];
  if (!allowedDbRoles || !allowedDbRoles.includes(user.role)) {
    throw Object.assign(new Error("Invalid role for this account"), { statusCode: 401 });
  }

  // 3. Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  // 4. Include adminRole if user is admin
  let adminRole: string | undefined;
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    if (user.facultyProfile) {
      adminRole = user.facultyProfile.adminRole || undefined;
    }
  }

  // 4. Sign JWT
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      departmentId: user.departmentId,
      adminRole,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // 5. Get full profile with deep relations
  const profile = await getUserById(user.id);

  return { token, profile };
}

/**
 * Retrieves the full user profile for a session restore (GET /api/auth/me).
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      studentProfile: {
        include: {
          mentor: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          courseEnrollments: {
            include: {
              offering: {
                include: {
                  course: true,
                  faculty: {
                    include: { user: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
          academicHistory: true,
          externalAssessments: true,
        },
      },
      facultyProfile: {
        include: {
          courseOfferings: {
            include: { course: true },
          },
          classCoordinatorFor: true,
          mentoredStudents: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  return buildProfile(user);
}

/**
 * Strips passwordHash and restructures the response for the frontend.
 */
function buildProfile(user: any) {
  const { passwordHash, ...safeUser } = user;

  // Compute EWS status for students
  if (safeUser.studentProfile) {
    const enrollments = safeUser.studentProfile.courseEnrollments || [];
    let totalAttendance = 0;
    let totalMarks = 0;
    let count = 0;

    for (const e of enrollments) {
      const conducted = e.offering?.lecturesConducted || 1;
      const attended = e.lecturesAttended || 0;
      totalAttendance += (attended / conducted) * 100;
      totalMarks += e.cieMarks || 0;
      count++;
    }

    const avgAttendance = count > 0 ? Math.round(totalAttendance / count) : 0;
    const avgMarks = count > 0 ? Math.round(totalMarks / count) : 0;

    let status: "safe" | "warning" | "critical" = "safe";
    if (avgAttendance < 60 || avgMarks < 40) status = "critical";
    else if (avgAttendance < 75 || avgMarks < 60) status = "warning";

    safeUser.studentProfile.avgAttendance = avgAttendance;
    safeUser.studentProfile.avgMarks = avgMarks;
    safeUser.studentProfile.ewsStatus = status;
  }

  return safeUser;
}

/**
 * Changes a user's password.
 */
export async function changePasswordUser(userId: string, currentPass: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const isValid = await bcrypt.compare(currentPass, user.passwordHash);
  if (!isValid) throw Object.assign(new Error("Incorrect current password"), { statusCode: 400 });

  const newHash = await bcrypt.hash(newPass, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { message: "Password updated successfully" };
}

// In-memory OTP store for simplicity. In production, use Redis.
// Key = email, Value = { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function requestAdminOtp(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw Object.assign(new Error("Invalid admin email"), { statusCode: 401 });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(user.email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 mins
  });

  // Mocking email sending
  console.log(`\n\n=== ✉️ EMAIL SENT TO ${user.email} ===`);
  console.log(`Your Admin Login OTP is: ${otp}`);
  console.log(`Expires in 5 minutes.\n======================================\n`);

  return { message: "OTP sent to your email" };
}

export async function verifyAdminOtp(email: string, otpInput: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) throw Object.assign(new Error("Invalid request"), { statusCode: 400 });

  const record = otpStore.get(user.email);
  if (!record) {
    throw Object.assign(new Error("OTP expired or not requested"), { statusCode: 400 });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(user.email);
    throw Object.assign(new Error("OTP expired"), { statusCode: 400 });
  }

  if (record.otp !== otpInput) {
    throw Object.assign(new Error("Invalid OTP"), { statusCode: 400 });
  }

  otpStore.delete(user.email);

  // Sign JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role, departmentId: user.departmentId },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  const profile = await getUserById(user.id);
  return { token, profile };
}
