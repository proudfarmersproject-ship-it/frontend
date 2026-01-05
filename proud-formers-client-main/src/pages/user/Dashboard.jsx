import { getAuthUser, logoutUser } from "../services/authService";

export default function Dashboard() {
  const user = getAuthUser();

  if (!user) return <h2>Please login</h2>;

  return (
    <>
      <h2>Welcome {user.first_name}</h2>
      <p>Role: {user.role}</p>
      <button onClick={logoutUser}>Logout</button>
    </>
  );
}
