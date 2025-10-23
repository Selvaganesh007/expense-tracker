import { Button, Divider, Form, Input, message } from "antd";
import {
  AuthCard,
  GoogleButton,
  PageContainer,
  SwitchText,
} from "../views/Auth/index.styles";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "../../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

interface SignInForm {
  email: string;
  password: string;
}

function SignInContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignInPage = location.pathname.includes("sign-in");

  async function getUserByUserId(userId: string) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("user_id", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData;
    } else {
      console.log("User not found");
      return null;
    }
  }

  const handleAddUsers = async (user: any) => {
    const firebaseToken = await user.getIdToken();
    localStorage.setItem("firebaseToken", firebaseToken);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const res = await getUserByUserId(user.uid);
        if (!res) {
          await addDoc(collection(db, "users"), {
            name: user.displayName,
            user_id: user.uid,
            email: user.email,
            photoUrl: user.photoURL,
          });
        }
      } else {
        console.log("No user signed in");
      }
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await handleAddUsers(user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const navigateSignUp = () => {
    location.pathname.includes("sign-in")
      ? navigate("/sign-up")
      : navigate("/sign-in");
  };

  const handleSignUp = async (val: { email: string; password: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        val.email,
        val.password
      );
      const user = userCredential.user;
      await handleAddUsers(user);
      if (user) {
        await sendEmailVerification(user);
        message.success(
          "Account created successfully! Please check your inbox for verification email."
        );
      }
      console.log("User created:", user);
      message.success("Account created successfully!");
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
    }
  };

  const handleSignIn = async (val: { email: string; password: string }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        val.email,
        val.password
      );
      const user = userCredential.user;
      console.log("Signed in:", user);
      if (!user.emailVerified) {
        message.warning("Please verify your email before signing in.");
        localStorage.clear();
        await auth.signOut();
        return;
      }
      navigate("/dashboard");
      return user;
    } catch (error: any) {
      console.error("Sign-in error:", error.message);
    }
  };

  const onFinish = async (values: SignInForm) => {
    try {
      if (isSignInPage) {
        const result = await handleSignIn(values);
        console.log("result", result);
        message.success("Signed in successfully!");
      } else {
        const result = await handleSignUp(values);
        console.log("result", result);
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      message.error(error.message);
    }
  };

  return (
    <PageContainer>
      <AuthCard
        title={location.pathname.includes("sign-in") ? "Sign In" : "Sign Up"}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Email address" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {location.pathname.includes("sign-in") ? "sign in" : "Create"}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>OR</Divider>

        <GoogleButton onClick={handleGoogleSignIn}>
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
          />
          Continue with Google
        </GoogleButton>

        <SwitchText>
          {location.pathname.includes("sign-in")
            ? "Don't have an account?"
            : "Already Have an account?"}{" "}
          <Button type="link" onClick={navigateSignUp}>
            {location.pathname.includes("sign-in") ? "sign up" : "sign in"}
          </Button>
        </SwitchText>
      </AuthCard>
    </PageContainer>
  );
}

export default SignInContainer;
