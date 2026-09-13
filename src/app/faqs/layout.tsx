import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | MIC Recruitments 2026",
  description:
    "Got questions about MIC Recruitments at VIT Chennai? Find answers about recruitment timelines, required skills, task workloads, and domain selections.",
  alternates: {
    canonical: "/faqs",
  },
  openGraph: {
    title: "Frequently Asked Questions | MIC Recruitments 2026",
    description:
      "Find answers to common questions about Microsoft Innovations Club recruitment process at VIT Chennai.",
    url: "https://recruitments.microsoftinnovations.club/faqs",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "When will the Recruitments Start?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Recruitments officially kick off right after our club orientation session! Keep an eye on our official club announcements and social media channels for exact registration deadlines and interview schedules."
      }
    },
    {
      "@type": "Question",
      "name": "What skills do I need to have in common?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Curiosity, consistency, and a passion to learn! Whether you are a beginner or an experienced coder/designer, we value proactive teamwork, creative problem-solving, and an eagerness to build impactful projects."
      }
    },
    {
      "@type": "Question",
      "name": "How many tasks will be assigned to us in a month?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Generally, members work on 1-2 practical team tasks or club projects per month. We ensure the workload remains flexible so you can easily balance coursework alongside club innovations and hackathons."
      }
    },
    {
      "@type": "Question",
      "name": "Can I explore both Tech and Non-Tech domains?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! You are welcome to explore multiple pathways during recruitments. In the final stage, you will be assigned to the core domain where your skills and interest shine brightest."
      }
    }
  ]
};

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
