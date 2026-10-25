
import { useState } from "react";

import PlantGame from "./games/PlantGame";
import RocketGame from "./games/RocketGame";
import SoundDetectiveGame from "./games/SoundDetectiveGame";
import LunchboxGame from "./games/LunchboxGame";
import StoryGame from "./games/StoryGame";

import { missions } from "./data/missions";

import {
  clearSession,
  readCompleted,
  readProfile,
  saveCompleted,
  saveProfile
} from "./lib/session";

import { say, stopSpeech } from "./lib/voice";

import type { Mission, Profile } from "./types";


const avatars = ["👩🏽‍🚀", "👨🏻‍🚀", "🧑🏽‍🚀", "👽", "🤖", "🐰"];

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(readProfile);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [completed, setCompleted] = useState<string[]>(readCompleted);

  const finishedCount = missions.filter((mission) => mission.ready && completed.includes(mission.id)).length;
  const totalAvailable = missions.filter((mission) => mission.ready).length;

  function finish(id: string) {
    setCompleted((old) => {
      if (old.includes(id)) return old;
      const next = [...old, id];
      saveCompleted(next);
      return next;
    });
  }

  function createProfile() {
    const cleanName = name.trim().slice(0, 24);
    if (!cleanName) return;
    const newProfile = { name: cleanName, avatar };
    saveProfile(newProfile);
    setProfile(newProfile);
  }

  function backToMissions() {
    stopSpeech();
    setActiveMission(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exit() {
    stopSpeech();
    clearSession();
    setProfile(null);
    setActiveMission(null);
    setCompleted([]);
    setName("");
  }

  if (!profile) return (
    <div className="entry-page">
      <div className="entry-card">
        <img src="/astronauta.png" alt="Astronauta, mascota de Exploradores Espaciales" />
        <div>
          <span className="eyebrow">BIENVENIDO, EXPLORADOR</span>
          <h1>¿Cómo te llamas?</h1>
          <p>Elige tu astronauta y empieza a jugar. No necesitas crear una cuenta.</p>
          <label htmlFor="player-name">Tu nombre o apodo</label>
          <input id="player-name" value={name} maxLength={24} autoComplete="off" placeholder="Ej. Luna" onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createProfile(); }} />
          <p className="avatar-label">Elige tu avatar</p>
          <div className="avatar-grid">
            {avatars.map((item) => <button type="button" className={avatar === item ? "avatar chosen" : "avatar"} aria-pressed={avatar === item} aria-label={`Elegir avatar ${item}`} onClick={() => setAvatar(item)} key={item}>{item}</button>)}
          </div>
          <button type="button" className="primary" disabled={!name.trim()} onClick={createProfile}>🚀 ¡Comenzar aventura!</button>
          <small className="privacy-note">Perfil temporal: no se envía a un servidor. Se conserva solo durante la sesión de esta pestaña.</small>
        </div>
      </div>
    </div>
  );

  return <div className="app">
    <header className="header">
      <div className="brand"><span>🌌</span><span>EXPLORADORES <b>ESPACIALES</b></span></div>
      <div className="header-right"><span className="player-name">{profile.avatar} {profile.name}</span><span className="stars">⭐ {finishedCount} / {totalAvailable}</span><button type="button" className="exit" onClick={exit}>Salir</button></div>
    </header>
    <main>
      {!activeMission ? <>
        <section className="hero">
          <div><span className="eyebrow">APRENDE JUGANDO</span><h1>¡Hola, {profile.name}! Tu aventura espacial comienza aquí</h1><p>Descubre planetas, supera misiones y aprende cosas increíbles.</p><button type="button" className="primary" onClick={() => document.getElementById("misiones")?.scrollIntoView({ behavior: "smooth" })}>🚀 ¡Explorar misiones!</button></div>
          <img src="/astronauta.png" alt="Astronauta infantil, mascota de la plataforma" />
        </section>
        <section className="content" id="misiones">
          <div className="section-title"><div><span className="eyebrow">ELIGE TU AVENTURA</span><h2>Misiones espaciales</h2></div><p>⭐ {finishedCount} actividades completadas</p></div>
          <div className="cards">{missions.map((mission) => <article key={mission.id} className={`mission ${!mission.ready ? "pending" : ""}`}>
            <div className="mission-icon" aria-hidden="true">{mission.icon}</div>
            <div className="mission-label">{mission.number ? `MISIÓN ${mission.number}` : "MISIÓN ADICIONAL"}</div>
            <h3>{mission.title}</h3><p>{mission.description}</p><small>{mission.area}</small>
            <button type="button" disabled={!mission.ready} onClick={() => { setActiveMission(mission); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              {!mission.ready ? "Pendiente de definición" : completed.includes(mission.id) ? "✓ Volver a jugar" : "Jugar ahora →"}
            </button>
          </article>)}</div>
        </section>
      </> : <section className={`content game-page ${activeMission.id === "planta" ? "game-page--plant" : ""}`}>
        <button type="button" className="back" onClick={backToMissions}>← Volver a las misiones</button>
        <div className="game-head"><span className="eyebrow">{activeMission.number ? `MISIÓN ${activeMission.number}` : "ACTIVIDAD ADICIONAL"} · {activeMission.area}</span><h1>{activeMission.icon} {activeMission.title}</h1><p>{activeMission.description}</p><button type="button" className="listen" onClick={() => say(activeMission.description)}>🔊 Escuchar instrucciones</button></div>
        <div className="game-card">
          {activeMission.id === "planta" ? <PlantGame onComplete={() => finish(activeMission.id)} /> :
            activeMission.id === "nave" ? <RocketGame onComplete={() => finish(activeMission.id)} /> :
            activeMission.id === "sonidos" ? <SoundDetectiveGame onComplete={() => finish(activeMission.id)} /> :
            activeMission.id === "lonchera" ? <LunchboxGame onComplete={() => finish(activeMission.id)} /> :
            activeMission.id === "historia" ? <StoryGame onComplete={() => finish(activeMission.id)} /> : null}
        </div>
        {completed.includes(activeMission.id) && <div className="reward" role="status">🏆 ¡Ya completaste esta actividad! Puedes volver a jugar.</div>}
      </section>}
    </main>
    <footer>🚀 Exploradores Espaciales · Proyecto educativo · Aprende jugando</footer>
  </div>;
}
