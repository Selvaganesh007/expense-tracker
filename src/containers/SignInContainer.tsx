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
  updateProfile,
  User,
} from "firebase/auth";
import { auth, db, provider } from "../../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { settings } from "../Utils/common";

interface SignInForm {
  fullName?: string;
  email: string;
  password: string;
}

function SignInContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignInPage = location.pathname.includes("sign-in");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

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

  const handleAddUsers = async (user: User, fullName?: string) => {
    const firebaseToken = await user.getIdToken();
    localStorage.setItem("firebaseToken", firebaseToken);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const res = await getUserByUserId(user.uid);
        if (!res) {
          const data = await addDoc(collection(db, "users"), {
            name: user.displayName || fullName || "N/A",
            user_id: user?.uid,
            email: user?.email,
            photoUrl: user?.photoURL ?? "N/A",
            settings: settings,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
          console.log("user data", data);
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
    form.resetFields();
    if (isSignInPage) {
      navigate("/sign-up");
    } else {
      navigate("/sign-in");
    }
  };

  const handleSignUp = async (val: SignInForm) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        val.email,
        val.password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: val?.fullName });
      await handleAddUsers(user, val?.fullName);
      if (user) {
        await sendEmailVerification(user);
        messageApi.success(
          "Account created successfully! Please check your inbox/spam for verification email."
        );
      }
      navigate("/sign-in");
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
        messageApi.warning(
          "Please verify your email before signing in. Check you inbox/spam folder for verification mail."
        );
        return false;
      }
      const firebaseToken = await user.getIdToken();
      localStorage.setItem("firebaseToken", firebaseToken);
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
      } else {
        const result = await handleSignUp(values);
        console.log("result", result);
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      message.error(error.message);
    }
  };

  const handleError = () => {
    messageApi.error("Please fill all required fields correctly.");
  };

  return (
    <PageContainer style={{ borderRadius: "10px" }}>
      {contextHolder}
      <AuthCard
        title={location.pathname.includes("sign-in") ? "Sign In" : "Sign Up"}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          form={form}
          onFinishFailed={handleError}
        >
          {!isSignInPage && (
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input placeholder="Full name" />
            </Form.Item>
          )}
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
          {isSignInPage && (
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </Button>
            </div>
          )}

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
