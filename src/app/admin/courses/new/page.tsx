import Link from "next/link";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default function NewCoursePage() {

  async function createCourse(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    if (title && description) {
      await prisma.course.create({
        data: {
          title,
          description,
          price: isNaN(price) ? 0 : price,
        }
      });
      redirect("/admin");
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <Link href="/admin" className="nav-logo">Nexus Admin</Link>
          <div className="nav-links">
            <Link href="/admin" className="nav-link">Back to Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="container py-16" style={{ maxWidth: '600px' }}>
        <h1 className="h1 mb-8">Create New Course</h1>
        
        <div className="card">
          <form action={createCourse}>
            <div className="input-group">
              <label className="input-label" htmlFor="title">Course Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                className="input-field" 
                placeholder="e.g. Advanced Web Design" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label" htmlFor="description">Description</label>
              <textarea 
                id="description" 
                name="description" 
                className="input-field" 
                placeholder="Detailed description of the course..."
                rows={4}
                required
              ></textarea>
            </div>
            
            <div className="input-group">
              <label className="input-label" htmlFor="price">Price ($)</label>
              <input 
                type="number" 
                id="price" 
                name="price" 
                className="input-field" 
                placeholder="e.g. 99.99" 
                step="0.01" 
                min="0"
                defaultValue="0"
              />
            </div>
            
            <div className="flex gap-4 mt-8">
              <Link href="/admin" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary">Create Course</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
