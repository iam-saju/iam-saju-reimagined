interface FooterProps {
  isDarkMode?: boolean;
}

const Footer = ({ isDarkMode = true }: FooterProps) => {
  const border = isDarkMode ? '#2a221c' : '#eee8d5';




  return (
    <footer className="w-full" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-8" style={{ borderTop: `1px solid ${border}`, opacity: 0.15 }}>
          {/* Subtle separator */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;