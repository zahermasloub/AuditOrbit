"use client";
import Container from "./components/layout/Container";
import Hero from "./components/layout/Hero";

export default function Home(){
  return (
    <Container className="py-8 sm:py-10">
      <Hero />
      {/* يمكن إبقاء قائمة الميزات الحالية تحت الـ Hero إن وُجدت */}
    </Container>
  );
}
