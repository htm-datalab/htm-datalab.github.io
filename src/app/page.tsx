import { getMeetings, getMembers, getProjects } from "@/lib/content";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { Hero } from "@/components/home/Hero";
import { TeamSection } from "@/components/home/TeamSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { MeetingsSection } from "@/components/home/MeetingsSection";

// 홈 — 원페이지 랜딩 (앵커: #team, #projects, #meetings)
export default function HomePage() {
  const members = getMembers();
  const projects = getProjects();
  const meetings = getMeetings();

  return (
    <>
      {/* 부드러운 스크롤은 홈에서만 */}
      <LenisProvider />
      <Hero members={members} />
      <TeamSection members={members} />
      <ProjectsSection projects={projects} />
      <MeetingsSection meetings={meetings} />
    </>
  );
}
