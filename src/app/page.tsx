import Link from "next/link";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

type FeaturedCourse = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  createdAt: Date;
  _count: { lessons: number; enrollments: number };
};

const getStats = unstable_cache(
  async () => {
    const [coursesCount, studentsCount, enrollmentsCount, lessonsCount] =
      await Promise.all([
        prisma.course.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.enrollment.count(),
        prisma.lesson.count(),
      ]);
    return { coursesCount, studentsCount, enrollmentsCount, lessonsCount };
  },
  ["homepage-stats"],
  { revalidate: 60 }
);

const getFeaturedCourses = unstable_cache(
  async () => {
    return prisma.course.findMany({
      take: 3,
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<FeaturedCourse[]>;
  },
  ["featured-courses"],
  { revalidate: 60 }
);

export default async function Home() {
  const stats = await getStats();
  const courses = await getFeaturedCourses();

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="nav-logo">Nexus Learning</div>
          <div className="nav-links">
            <Link href="/courses" className="nav-link">
              Courses
            </Link>
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="h1 text-gradient">Nexus Learning Platform</h1>
          <p className="text-muted h3 mb-8">
            A modern full-stack e-learning solution built with Next.js 16,
            Prisma, and SQLite.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/courses" className="btn btn-primary">
              Explore Courses
            </Link>
            <Link href="/admin" className="btn btn-secondary">
              Open Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Dashboard */}
      <div className="container py-16">
        <h2 className="h2 text-center mb-8">Live Platform Stats</h2>
        <div className="grid grid-cols-2 grid-cols-md-4">
          <div className="card text-center">
            <h2 className="h2 mb-2 text-gradient">{stats.coursesCount}</h2>
            <p className="text-muted">Courses</p>
          </div>
          <div className="card text-center">
            <h2 className="h2 mb-2 text-gradient">{stats.studentsCount}</h2>
            <p className="text-muted">Students</p>
          </div>
          <div className="card text-center">
            <h2 className="h2 mb-2 text-gradient">
              {stats.enrollmentsCount}
            </h2>
            <p className="text-muted">Enrollments</p>
          </div>
          <div className="card text-center">
            <h2 className="h2 mb-2 text-gradient">{stats.lessonsCount}</h2>
            <p className="text-muted">Lessons</p>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="container py-16" style={{ paddingTop: 0 }}>
        <h2 className="h2 text-center mb-8">Featured Courses</h2>
        <div className="grid grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="card flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="badge">New</span>
                  <span className="text-gradient font-bold">
                    ${course.price}
                  </span>
                </div>
                <h3 className="h3">{course.title}</h3>
                <p className="text-muted mb-4">{course.description}</p>
                <div className="text-muted text-sm mb-4">
                  {course._count.lessons} Lessons · {course._count.enrollments}{" "}
                  Enrolled
                </div>
              </div>
              <Link
                href={`/courses/${course.id}`}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                View Course
              </Link>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-muted text-center" style={{ gridColumn: "1 / -1" }}>
              No courses yet. Create one from the admin panel.
            </p>
          )}
        </div>
        <div className="text-center mt-8">
          <Link href="/courses" className="btn btn-secondary">
            View All Courses
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="container py-16" style={{ paddingTop: 0 }}>
        <h2 className="h2 text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-3">
          <div className="card">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(109, 40, 217, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              📚
            </div>
            <h3 className="h3">1. Browse Courses</h3>
            <p className="text-muted">
              Explore the course catalog with real data fetched from a Prisma +
              SQLite database.
            </p>
          </div>
          <div className="card">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(37, 99, 235, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              🎓
            </div>
            <h3 className="h3">2. View Lessons</h3>
            <p className="text-muted">
              Click any course to see its syllabus, lessons, and content — all
              rendered server-side.
            </p>
          </div>
          <div className="card">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              ⚙️
            </div>
            <h3 className="h3">3. Manage via Admin</h3>
            <p className="text-muted">
              Use the admin dashboard to create, edit, and delete courses with
              server actions.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="container py-16" style={{ paddingTop: 0 }}>
        <h2 className="h2 text-center mb-8">Tech Stack</h2>
        <div
          className="flex justify-center gap-4 flex-wrap"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          {["Next.js 16", "React 19", "TypeScript", "Prisma", "SQLite", "Turbopack"].map(
            (tech) => (
              <span
                key={tech}
                className="badge"
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container py-16 text-center" style={{ paddingTop: 0 }}>
        <h2 className="h2 mb-4">Ready to Explore?</h2>
        <p className="text-muted mb-8">
          Check out the live courses or head to the admin panel to manage content.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
          <Link href="/admin" className="btn btn-secondary">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

