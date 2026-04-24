import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePlayer({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(courseId)) {
    return notFound();
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    return notFound();
  }

  const firstLesson = course.lessons[0];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <Link href="/" className="nav-logo">Nexus Learning</Link>
          <div className="nav-links">
            <Link href="/courses" className="nav-link">Back to Catalog</Link>
          </div>
        </div>
      </nav>

      <div className="container py-8" style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Main Player Area */}
        <div style={{ flex: '1' }}>
          <h1 className="h2 mb-4">{course.title}</h1>
          
          <div 
            className="video-placeholder" 
            style={{ 
              width: '100%', 
              aspectRatio: '16/9', 
              background: 'var(--input-bg)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>▶</div>
              <p className="text-muted">Interactive Video Player Placeholder</p>
            </div>
          </div>

          <div className="card">
            <h3 className="h3 mb-4">Course Description</h3>
            <p className="text-muted">{course.description}</p>
            
            <div className="mt-8">
              <h3 className="h3 mb-4">About the Instructor</h3>
              <div className="flex items-center gap-4">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}></div>
                <div>
                  <div className="font-bold">John Admin</div>
                  <div className="text-muted text-sm">Lead Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Lessons List */}
        <div style={{ width: '350px' }}>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 className="h3 mb-4">Syllabus</h3>
            
            <div className="flex flex-col gap-2">
              {course.lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id} 
                  className={`p-3 rounded flex flex-col gap-1`}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px',
                    background: idx === 0 ? 'rgba(109, 40, 217, 0.1)' : 'transparent',
                    border: idx === 0 ? '1px solid rgba(109, 40, 217, 0.3)' : '1px solid transparent',
                    borderBottom: idx !== 0 ? '1px solid var(--border)' : ''
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Lesson {idx + 1}</span>
                    {idx === 0 && <span className="badge">Playing</span>}
                  </div>
                  <div className="text-sm">{lesson.title}</div>
                  {idx === 0 && (
                    <div className="text-muted text-xs mt-2">{lesson.content}</div>
                  )}
                </div>
              ))}
            </div>
            
            <button className="btn btn-primary mt-8" style={{ width: '100%' }}>
              Mark as Complete
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
