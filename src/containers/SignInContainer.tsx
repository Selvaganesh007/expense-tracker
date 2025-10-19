import { Button, Flex, Input, Typography } from "antd";
import { FormElementContainer } from "../views/Auth/index.styles";
import { FaGoogle } from "react-icons/fa";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

function SignInContainer() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
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
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const navigateSignUp = () => {
    location.pathname.includes("sign-in")
      ? navigate("/sign-up")
      : navigate("/sign-in");
  };

  return (
    <Flex
      style={{ flexDirection: "column", width: "300px", marginTop: "100px" }}
      gap={10}
    >
      <FormElementContainer>
        <label>Email Address</label>
        <Input placeholder="Enter Email Address.." required />
      </FormElementContainer>
      <FormElementContainer>
        <label>Password</label>
        <Input placeholder="Enter password.." required />
      </FormElementContainer>
      <Button
        size="middle"
        variant="filled"
        type="primary"
        style={{ marginTop: "10px" }}
      >
        Sign in
      </Button>
      {location.pathname.includes("sign-in") && (
        <Button
          size="middle"
          color="default"
          variant="outlined"
          icon={<FaGoogle />}
          style={{ marginTop: "10px" }}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
      )}
      <Typography.Text style={{ textAlign: "center" }}>
        {location.pathname.includes("sign-in")
          ? "Don't have an account?"
          : "Already have account?"}{" "}
        <Button
          variant="text"
          type="link"
          color="default"
          onClick={navigateSignUp}
        >
          {location.pathname.includes("sign-in") ? "Sign up" : "Sign in"}
        </Button>
      </Typography.Text>
    </Flex>
  );
}

export default SignInContainer;
