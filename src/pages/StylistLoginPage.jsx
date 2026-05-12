import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function StylistLoginPage(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e){
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(error){
      setError(error.message);
    }else{
      navigate("/dashboard", { replace: true });
    }
  }

  return(
    <div className="max-w-md mx-auto py-16">

      <h1 className="text-2xl font-semibold mb-6">
        Stylist Login
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Log In
        </button>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

      </form>

    </div>
  )
}