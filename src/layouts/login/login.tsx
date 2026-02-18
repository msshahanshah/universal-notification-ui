// login

import { ChangeEvent, useState } from "react";
import {
  // CssBaseline,
  styled,
  Typography,
  useColorScheme,
  useTheme,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";

import Button from "src/components/button";
import Input from "src/components/input";
import { useAuthenticate } from "src/hooks/useLogin";
import { passwordRegex, usernameRegex } from "src/utility/constants";
import PasswordInput from "src/components/password-input";

import "src/App.css";
import "./login.css";
import COLORS from "src/utility/colors";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[6],

  [theme.breakpoints.up("sm")]: {
    width: 450,
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100dvh",
  padding: theme.spacing(2),

  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

const Login = (props: { disableCustomTheme?: boolean }) => {
  // const { setMode } = useColorScheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasApiError, setHasApiError] = useState(false);

  const theme = useTheme();

  const { mutateAsync, isPending, isError, reset } = useAuthenticate();

  const isDisabled =
    username === "" || password === "" || isPending || hasApiError;

  const onSubmit = async ({ username, password }: any) => {
    // setMode("dark");
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
    <>
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h5"
            sx={{
              width: "100%",
              fontSize: "clamp(2rem, 10vw, 2.15rem)",
              color: theme.palette.text.secondary,
            }}
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
              style={{ color: COLORS.WHITE }}
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
              style={{ color: COLORS.WHITE }}
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
    </>
  );
};

export default Login;
