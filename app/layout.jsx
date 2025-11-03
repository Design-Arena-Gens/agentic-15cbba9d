export const metadata = {
  title: "AI Digital Product Research Agent",
  description: "Agentic research assistant for digital products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        color: '#0f172a',
        background: '#f8fafc'
      }}>
        {children}
      </body>
    </html>
  );
}
