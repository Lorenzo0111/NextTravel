import { useTheme } from "@/components/Theme";
import { useSession } from "@/components/auth/AuthContext";
import { honoClient } from "@/components/fetcher";
import { i18n } from "@/components/i18n";
import { Button, TextInput } from "@/components/injector";
import Plane from "@/components/svg/Plane";
import { Alert } from "@/components/ui/Alert";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const Login = () => {
  const theme = useTheme();
  const { session, login } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session) router.push("/");
  }, [session, router]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (Platform.OS !== "web") Keyboard.dismiss();
      }}
    >
      <View className="flex flex-1 flex-col items-center justify-center gap-3 bg-background">
        <Link
          href="/auth"
          style={{
            position: "absolute",
            top: -300,
            right: 60,
          }}
        >
          <Plane color={theme.text} />
        </Link>

        <View className="m-auto flex w-5/6 flex-col items-center justify-center gap-3">
          <TextInput
            mode="outlined"
            placeholder="Email"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="w-full"
          />
          <TextInput
            mode="outlined"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="w-full"
          />
          <Button
            mode="contained"
            className="w-full"
            onPress={() => {
              honoClient.auth.login
                .$post({ json: { email, password } })
                .then(async (res) => await res.json())
                .then(async (data) => {
                  if ("token" in data) {
                    await login(data.token);
                    router.push("/");
                  } else {
                    setError(
                      i18n.t(`errors.${data.t || "auth.invalid_email"}`),
                    );
                  }
                });
            }}
          >
            {i18n.t("account.login")}
          </Button>
        </View>

        <Alert
          title={i18n.t("errors.screen.title")}
          message={error}
          onDismiss={() => {
            setError(undefined);
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
