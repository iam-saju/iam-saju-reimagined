interface FooterProps {
  isDarkMode?: boolean;
}

const Footer = ({ isDarkMode = true }: FooterProps) => {
  const border = isDarkMode ? '#073642' : '#eee8d5';




  return (
    <footer className="w-full" style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-8" style={{ borderTop: `1px solid ${border}`, opacity: 0.15 }}>
          {/* Subtle separator */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;