// MDX → RSC 렌더링 (빌드 타임 컴파일, 클라이언트 JS 불필요).
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { ComponentProps, ReactNode } from "react";
import { TableauEmbed } from "./TableauEmbed";
import { Callout } from "./Callout";
import { Highlight } from "@/components/motion/Highlight";

// 마크다운 파일 안에서 쓸 수 있는 컴포넌트 목록 (README 참조)
const mdxComponents = {
  TableauEmbed,
  Callout,
  Highlight,
  // 표는 모바일에서 가로 스크롤 컨테이너로 감싼다 (본문 가로 넘침 방지)
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
  // 외부 링크는 새 탭 + noopener
  a: ({ href = "", children, ...rest }: ComponentProps<"a">) => {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
};

export async function MdxContent({ source }: { source: string }): Promise<ReactNode> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePrettyCode, { theme: "github-light", keepBackground: false }],
        ],
      },
    },
  });

  return <div className="mdx-content">{content}</div>;
}
