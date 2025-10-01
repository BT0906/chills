'use client';

import React from 'react';
import { useParams } from 'next/navigation';

const CourseDashboardPage = () => {
  const params = useParams();
  const course = params?.course as string | undefined;

  return (
    <main>
      <h1>Course Dashboard</h1>
      <p>Welcome to your dashboard for course: <strong>{course}</strong></p>
      {/* Add course-specific content here */}
    </main>
  );
};

export default CourseDashboardPage;
