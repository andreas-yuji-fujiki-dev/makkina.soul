interface NoticeProps {
  text: string;
}

export function Notice({ text }: NoticeProps) {
  if (!text) return null;
  return <p className="notice">{text}</p>;
}
