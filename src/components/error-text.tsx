const ErrorText = ({ children }: { children: string }) => (
  <div
    style={{
      fontSize: 11,
      color: "#d32f2f",
      marginTop: -4,
      height: 11,
    }}
  >
    {children}
  </div>
);

export default ErrorText;
