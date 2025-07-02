import { useParams } from "react-router-dom";

function ProfilePage() {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">Stylist Profile</h2>
      <p>This is the profile for stylist ID: {id}</p>
    </div>
  );
}

export default ProfilePage;