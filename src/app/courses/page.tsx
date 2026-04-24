import Link from "next/link";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

type CourseWithLessons = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  createdAt: Date;
  _count: { lessons: number };
};

const getCourses = unstable_cache(
  async () => {
    return prisma.course.findMany({
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    }) as Promise<CourseWithLessons[]>;
  },
  ["courses-list"],
  { revalidate: 60 }
);

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <Link href="/" className="nav-logo">Nexus Learning</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/admin" className="nav-link">Admin</Link>
          </div>
        </div>
      </nav>

      <div className="container py-16">
        <h1 className="h1">Course Catalog</h1>
        <p className="text-muted h3 mb-8">Explore our available courses and start learning today.</p>
        
        <div className="grid grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="badge">New</span>
                  <span className="text-gradient font-bold">${course.price}</span>
                </div>
                <h3 className="h3">{course.title}</h3>
                <p className="text-muted mb-4">{course.description}</p>
                <div className="text-muted text-sm mb-4">
                  {course._count.lessons} Lessons
                </div>
              </div>
              <Link href={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                View Course
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
