import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  // Seed PageContent for Home
  const homeContent = [
    { page: 'home', section: 'hero', key: 'title', value: 'Geunaseh Jeumala' },
    { page: 'home', section: 'hero', key: 'subtitle', value: 'Organisasi Mahasiswa yang Berfokus pada Pengembangan Teknologi dan Inovasi' },
    { page: 'home', section: 'hero', key: 'description', value: 'Kami adalah komunitas mahasiswa yang berdedikasi untuk mengembangkan keterampilan teknologi, berbagi pengetahuan, dan menciptakan solusi inovatif untuk masa depan.' },
    { page: 'home', section: 'about', key: 'title', value: 'Tentang Kami' },
    { page: 'home', section: 'about', key: 'content', value: 'Geunaseh Jeumala adalah organisasi mahasiswa yang berfokus pada pengembangan teknologi, inovasi, dan kolaborasi. Kami percaya bahwa dengan bersatu, kita dapat menciptakan dampak positif yang lebih besar.' },
    { page: 'about', section: 'hero', key: 'title', value: 'Geunaseh Jeumala' },
    { page: 'about', section: 'hero', key: 'subtitle', value: 'Bersama Membangun Masa Depan Teknologi' },
    { page: 'about', section: 'vision', key: 'title', value: 'Visi Kami' },
    { page: 'about', section: 'vision', key: 'content', value: 'Menjadi organisasi mahasiswa terdepan dalam pengembangan teknologi dan inovasi yang memberikan dampak positif bagi masyarakat.' },
    { page: 'about', section: 'mission', key: 'title', value: 'Misi Kami' },
    { page: 'about', section: 'mission', key: 'content', value: 'Mengembangkan keterampilan teknologi anggota, memfasilitasi kolaborasi dan inovasi, serta berkontribusi pada kemajuan teknologi di Indonesia.' },
    { page: 'philosophy', section: 'hero', key: 'title', value: 'Filosofi Kami' },
    { page: 'philosophy', section: 'hero', key: 'subtitle', value: 'Prinsip dan Nilai yang Kami Pegang' },
    { page: 'philosophy', section: 'content', key: 'main', value: 'Kami percaya pada kekuatan kolaborasi, pembelajaran berkelanjutan, dan inovasi yang berdampak. Setiap anggota adalah bagian penting dari ekosistem kami.' },
  ]

  for (const content of homeContent) {
    await prisma.pageContent.upsert({
      where: {
        page_section_key: {
          page: content.page,
          section: content.section,
          key: content.key,
        },
      },
      update: { value: content.value },
      create: content,
    })
  }

  // Seed sample members for galaxy effect
  const members = [
    'Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo',
    'Fitri Handayani', 'Gunawan Wijaya', 'Hana Pertiwi', 'Indra Kusuma', 'Joko Widodo',
    'Kartika Sari', 'Lukman Hakim', 'Maya Angelina', 'Nanda Pratama', 'Olivia Tan',
    'Putra Mahendra', 'Qori Sandioriva', 'Rudi Hartono', 'Sari Dewi', 'Tono Sumarno',
    'Umar Bakri', 'Vina Panduwinata', 'Wawan Setiawan', 'Xena Warrior', 'Yudi Latif',
    'Zahra Amalia', 'Andi Wijaya', 'Bella Saphira', 'Citra Kirana', 'Dimas Anggara',
  ]

  await prisma.pageContent.upsert({
    where: {
      page_section_key: {
        page: 'about',
        section: 'members',
        key: 'list',
      },
    },
    update: { value: JSON.stringify(members) },
    create: {
      page: 'about',
      section: 'members',
      key: 'list',
      value: JSON.stringify(members),
    },
  })

  // Seed Articles
  await prisma.article.upsert({
    where: { slug: 'welcome-to-geunaseh-jeumala' },
    update: {},
    create: {
      title: 'Selamat Datang di Geunaseh Jeumala',
      slug: 'welcome-to-geunaseh-jeumala',
      summary: 'Perkenalan organisasi dan visi misi kami untuk masa depan teknologi Indonesia.',
      content: '<p>Selamat datang di Geunaseh Jeumala! Kami adalah organisasi mahasiswa yang berdedikasi untuk mengembangkan teknologi dan inovasi.</p><p>Bergabunglah dengan kami dalam perjalanan menciptakan masa depan yang lebih baik melalui teknologi.</p>',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      tags: JSON.stringify(['teknologi', 'organisasi', 'mahasiswa']),
      published: true,
    },
  })

  await prisma.article.upsert({
    where: { slug: 'workshop-web-development' },
    update: {},
    create: {
      title: 'Workshop Web Development 2025',
      slug: 'workshop-web-development',
      summary: 'Ikuti workshop web development kami dan pelajari teknologi terkini.',
      content: '<p>Workshop web development kami akan membahas teknologi terkini seperti React, Next.js, dan Tailwind CSS.</p><p>Daftar sekarang dan tingkatkan skill development Anda!</p>',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      tags: JSON.stringify(['workshop', 'web development', 'react']),
      published: true,
    },
  })

  // Seed Media
  await prisma.media.create({
    data: {
      title: 'Team Meeting 2025',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
      description: 'Pertemuan tim Geunaseh Jeumala 2025',
    },
  })

  await prisma.media.create({
    data: {
      title: 'Coding Session',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
      description: 'Sesi coding bersama anggota',
    },
  })

  // Seed Documentation
  await prisma.documentation.upsert({
    where: { slug: 'panduan-bergabung' },
    update: {},
    create: {
      title: 'Panduan Bergabung dengan Geunaseh Jeumala',
      slug: 'panduan-bergabung',
      description: 'Langkah-langkah untuk menjadi anggota Geunaseh Jeumala',
      content: '<h2>Cara Bergabung</h2><p>1. Isi formulir pendaftaran<br/>2. Ikuti sesi orientasi<br/>3. Pilih divisi yang sesuai<br/>4. Mulai berkontribusi!</p>',
      attachments: JSON.stringify([]),
      published: true,
    },
  })

  // Seed Activity
  await prisma.activity.upsert({
    where: { slug: 'hackathon-2025' },
    update: {},
    create: {
      title: 'Hackathon 2025',
      slug: 'hackathon-2025',
      description: 'Kompetisi pengembangan aplikasi 48 jam',
      content: '<p>Hackathon tahunan kami menghadirkan tantangan menarik untuk mengembangkan solusi teknologi inovatif dalam 48 jam.</p>',
      attachments: JSON.stringify([]),
      published: true,
    },
  })

  // Seed Report
  await prisma.report.upsert({
    where: { slug: 'laporan-kegiatan-2024' },
    update: {},
    create: {
      title: 'Laporan Kegiatan 2024',
      slug: 'laporan-kegiatan-2024',
      description: 'Ringkasan kegiatan organisasi selama tahun 2024',
      content: '<h2>Ringkasan Kegiatan</h2><p>Tahun 2024 telah menjadi tahun yang produktif dengan berbagai kegiatan dan pencapaian.</p>',
      attachments: JSON.stringify([]),
      published: true,
    },
  })

  // Seed Events
  await prisma.event.upsert({
    where: { slug: 'tech-talk-ai-2025' },
    update: {},
    create: {
      title: 'Tech Talk: AI & Machine Learning',
      slug: 'tech-talk-ai-2025',
      date: new Date('2025-02-15'),
      time: '14:00 - 16:00 WIB',
      location: 'Auditorium Kampus',
      description: 'Diskusi mendalam tentang perkembangan AI dan Machine Learning dengan praktisi industri.',
      bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      capacity: 100,
      published: true,
    },
  })

  await prisma.event.upsert({
    where: { slug: 'workshop-nextjs-2025' },
    update: {},
    create: {
      title: 'Workshop: Next.js untuk Pemula',
      slug: 'workshop-nextjs-2025',
      date: new Date('2025-03-01'),
      time: '09:00 - 17:00 WIB',
      location: 'Lab Komputer 3',
      description: 'Workshop hands-on untuk mempelajari Next.js dari dasar hingga deployment.',
      bannerImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      capacity: 50,
      published: true,
    },
  })

  // Seed Tasks
  await prisma.task.create({
    data: {
      title: 'Persiapan Workshop Next.js',
      description: 'Menyiapkan materi dan environment untuk workshop',
      dueDate: new Date('2025-02-25'),
      assignee: 'Ahmad Rizki',
      priority: 'high',
      status: 'in_progress',
    },
  })

  await prisma.task.create({
    data: {
      title: 'Update Website Organisasi',
      description: 'Menambahkan konten baru dan memperbaiki bug',
      dueDate: new Date('2025-02-10'),
      assignee: 'Siti Nurhaliza',
      priority: 'medium',
      status: 'pending',
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
