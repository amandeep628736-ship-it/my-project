import Link from "next/link";
import { prisma } from "@/lib/db";
import { revalidatePath, unstable_cache } from "next/cache";

const getAdminData = unstable_cache(
  async () => {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { lessons: true, enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalEnrollments = courses.reduce((acc, course) => acc + course._count.enrollments, 0);
    return { courses, totalStudents, totalEnrollments };
  },
  ["admin-dashboard"],
  { revalidate: 60 }
);

export default async function AdminDashboard() {
  const { courses, totalStudents, totalEnrollments } = await getAdminData();

  // Server Action to delete a course
  async function deleteCourse(formData: FormData) {
    "use server";
    const courseId = parseInt(formData.get("courseId") as string, 10);
    if (!isNaN(courseId)) {
      await prisma.course.delete({ where: { id: courseId } });
      revalidatePath("/admin");
      revalidatePath("/courses");
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <Link href="/" className="nav-logo">Nexus Admin</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Main Site</Link>
            <span className="badge badge-success">Admin Mode</span>
          </div>
        </div>
      </nav>

      <div className="container py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="h1 mb-0">Admin Dashboard</h1>
          <Link href="/admin/courses/new" className="btn btn-primary">
            + Create New Course
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 mb-16">
          <div className="card text-center">
            <h2 className="h2 mb-2">{courses.length}</h2>
            <p className="text-muted">Total Courses</p>
          </div>
          <div className="card text-center">
            <h2 className="h2 mb-2">{totalStudents}</h2>
            <p className="text-muted">Registered Students</p>
          </div>
          <div className="card text-center">
            <h2 className="h2 mb-2">{totalEnrollments}</h2>
            <p className="text-muted">Total Enrollments</p>
          </div>
        </div>

        <h2 className="h2 mb-6">Manage Courses</h2>
        
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Course Title</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Lessons</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div className="font-bold">{course.title}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>${course.price}</td>
                  <td style={{ padding: '1rem' }}>{course._count.lessons}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                      <Link href={`/admin/courses/${course.id}/edit`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Edit
                      </Link>
                      <form action={deleteCourse}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <button type="submit" className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">
                    No courses found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
