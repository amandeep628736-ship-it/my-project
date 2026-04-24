import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data to avoid unique constraint errors during multiple seeds
  await prisma.enrollment.deleteMany({})
  await prisma.lesson.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.user.deleteMany({})

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Jane Student',
      role: 'STUDENT',
    },
  })

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'John Admin',
      role: 'ADMIN',
    },
  })

  const course = await prisma.course.create({
    data: {
      title: 'Advanced Full-Stack Engineering',
      description: 'Learn modern full-stack web development with Next.js, Prisma, and dynamic CSS styling.',
      price: 99.99,
      lessons: {
        create: [
          { title: 'Introduction to Next.js', content: 'What is Next.js and Server Components?', order: 1 },
          { title: 'Prisma Basics', content: 'Working with ORMs.', order: 2 },
          { title: 'Advanced Styling', content: 'Crafting premium digital experiences.', order: 3 },
        ],
      },
    },
  })

  const course2 = await prisma.course.create({
    data: {
      title: 'UI/UX Masterclass',
      description: 'Become a master of visual design, color theory, and user experience.',
      price: 149.99,
      lessons: {
        create: [
          { title: 'Color Theory', content: 'Choosing optimal palettes.', order: 1 },
          { title: 'Typography', content: 'Using fonts effectively.', order: 2 },
        ],
      },
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      progress: 33,
    }
  })

  console.log('Database seeded with test users and courses.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
