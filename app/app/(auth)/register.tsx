import { useTheme } from "@/components/Theme";
import { useSession } from "@/components/auth/AuthContext";
import { honoClient } from "@/components/fetcher";
import { i18n } from "@/components/i18n";
import { Button, SafeAreaView, Text, TextInput } from "@/components/injector";
import Banner from "@/components/svg/Banner";
import { Alert } from "@/components/ui/Alert";
import { FontAwesome } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { TextInput as RNTextInput } from "react-native-paper";

const Register = () => {
  const theme = useTheme();
  const { login } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <SafeAreaView className="flex flex-1 flex-col items-center justify-center gap-3 bg-background">
      <View className="m-auto flex w-5/6 flex-col items-center justify-center gap-3">
        <Banner
          style={{
            marginBottom: 100,
          }}
          color={theme.text}
        />

        <TextInput
          mode="outlined"
          placeholder="Name"
          autoComplete="name"
          value={name}
          onChangeText={setName}
          className="w-full"
          left={
            <RNTextInput.Icon
              icon={(props) => <FontAwesome name="user" {...props} />}
              size={25}
            />
          }
        />
        <TextInput
          mode="outlined"
          placeholder="Email"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          className="w-full"
          left={
            <RNTextInput.Icon
              icon={(props) => <FontAwesome name="at" {...props} />}
              size={25}
            />
          }
        />
        <TextInput
          mode="outlined"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="w-full"
          left={
            <RNTextInput.Icon
              icon={(props) => <FontAwesome name="lock" {...props} />}
              size={25}
            />
          }
        />
        <TextInput
          mode="outlined"
          placeholder={i18n.t("account.confirm_password")}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="w-full"
          left={
            <RNTextInput.Icon
              icon={(props) => <FontAwesome name="lock" {...props} />}
              size={25}
            />
          }
        />
        <Button
          mode="contained"
          className="w-full"
          onPress={() => {
            honoClient.auth.register
              .$post({ json: { name, email, password, confirmPassword } })
              .then(async (res) => await res.json())
              .then((data) => {
                if ("token" in data) {
                  login(data.token);
                  router.push("/account");
                } else {
                  setError(i18n.t(`errors.${data.t || "auth.invalid_email"}`));
                }
              });
          }}
        >
          {i18n.t("account.submit")}
        </Button>
        <View className="flex w-full flex-row justify-between">
          <Text>
            {`${i18n.t("account.already_member")} `}
            <Link href="/login" className="text-primary">
              {i18n.t("account.login")}
            </Link>
          </Text>
        </View>
      </View>

      <Alert
        title={i18n.t("errors.screen.title")}
        message={error}
        onDismiss={() => {
          setError(undefined);
        }}
      />
    </SafeAreaView>
  );
};

export default Register;
