const Footer: React.FC = () => {
  return (
    <div
      style={{
        marginLeft: "30px",
        marginRight: "70px",
        marginBottom: "3%",
        paddingBottom: "3%",
        width: "calc(100% - 100px)",
        textAlign: "center",
        backgroundColor: "#ffffff",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: "0",
          color: "black",
          position: "relative",
          textAlign: "left",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        Our mission is to connect the world and create a better future. Our
        networks keep family, friends, businesses and governments connected and
        we play an important <br />
        role in promoting positive change in society.
      </p>

      <p
        style={{
          margin: "0",
          color: "black",
          position: "relative",
          textAlign: "left",
          marginTop: "10px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        © 2024 TechStore. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
