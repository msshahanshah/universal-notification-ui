import { ChangeEvent, useState } from "react";
import { CssBaseline, styled, Typography } from "@mui/material";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";

import Button from "src/components/button";
import Input from "src/components/input";
import { useAuthenticate } from "src/hooks/useLogin";
import { passwordRegex, usernameRegex } from "src/utility/constants";
import PasswordInput from "src/components/password-input";
import AppTheme from "src/theme/app-theme";

import "src/App.css";
import "./login.css";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

const Login = (props: { disableCustomTheme?: boolean }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasApiError, setHasApiError] = useState(false);

  const { mutateAsync, isPending, isError, reset } = useAuthenticate();

  const isDisabled =
    username === "" || password === "" || isPending || hasApiError;

  const onSubmit = async ({ username, password }: any) => {
    if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
      setErrorMessage("Invalid username or password");
      setHasApiError(true);
      return;
    }

    try {
      const response = await mutateAsync({ username, password });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      // success → clear all error state
      setErrorMessage("");
      setHasApiError(false);

      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Login failed");
      setHasApiError(true); // 🔥 disable button after API error
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setErrorMessage("");
    setHasApiError(false); // ✅ re-enable button
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage("");
    setHasApiError(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      {/* <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} /> */}
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h5"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Welcome Back!
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isDisabled) return;
              onSubmit({ username, password });
            }}
            autoComplete="off"
          >
            <Input
              label="Username"
              value={username}
              onChange={handleUsernameChange}
              type="text"
              id="username"
              autoComplete="off"
              className="input-field"
              dataTestId="username-input"
              name="user_field"
              autoFocus
            />
            <PasswordInput
              label="Password"
              name="pass_field"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              className="input-field"
              dataTestId="password-input"
            />

            <div style={{ height: 20 }}>
              <p className="error-message">{errorMessage || ""}</p>
            </div>
            <Button
              disabled={isDisabled}
              label="Login"
              id="login-btn"
              name="submit"
              role="button"
              type="submit"
              isLoading={isPending}
              className={isDisabled ? "btn-disabled" : "btn"}
            />
          </form>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
};

export default Login;
