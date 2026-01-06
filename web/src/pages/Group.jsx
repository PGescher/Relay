import React, { useState } from "react";
import { api } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function Group() {
  const groupId = localStorage.getItem("groupId");
  const inviteCode = localStorage.getItem("inviteCode");

  const nav = useNavigate();
  const [groupName, setGroupName] = useState("Friends");
  const [invite, setInvite] = useState("");
  const [msg, setMsg] = useState("");

  async function create() {
    setMsg("");
    try {
      const g = await api.createGroup(groupName);
      localStorage.setItem("groupId", String(g.id));
      localStorage.setItem("inviteCode", g.invite_code);
      setMsg(`Created ✅ Invite code: ${g.invite_code}`);
      nav("/settings");
    } catch (e) {
      setMsg(`Create failed: ${e.message}`);
    }
  }

  async function join() {
    setMsg("");
    try {
      const r = await api.joinGroup(invite.trim().toUpperCase());
      localStorage.setItem("groupId", String(r.group_id));
      setMsg("Joined ✅");
      nav("/settings");
    } catch (e) {
      setMsg(`Join failed: ${e.message}`);
    }
  }



  function ReturnToSettings() {
    setMsg("");
    nav("/settings");
  }

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>Group</h2>

      <div style={{ marginBottom: 12, opacity: 0.85 }}>
        Group ID: {groupId || "—"}<br />
        Invite Code: {inviteCode || "—"}<br />
      </div>

      <h3>Create</h3>
      <input
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />
      <button onClick={create} style={{ width: "100%", padding: 12, marginTop: 10 }}>
        Create Group
      </button>

      <h3 style={{ marginTop: 30 }}>Join</h3>
      <input
        placeholder="Invite Code"
        value={invite}
        onChange={(e) => setInvite(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />
      <button onClick={join} style={{ width: "100%", padding: 12, marginTop: 10 }}>
        Join Group
      </button>

      {msg && <p style={{ marginTop: 15 }}>{msg}</p>}


      <button onClick={ReturnToSettings} style={{ marginTop: 30 }}>
        Return
      </button>

    </div>
  );
}


//Need Return to Main Menu