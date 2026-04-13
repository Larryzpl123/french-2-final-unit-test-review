import { useState, useEffect, useCallback, useMemo } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const BODY_PARTS = [
  { fr: "la main", en: "hand" }, { fr: "le pied", en: "foot" }, { fr: "la jambe", en: "leg" },
  { fr: "le bras", en: "arm" }, { fr: "l'épaule", en: "shoulder" }, { fr: "le genou", en: "knee" },
  { fr: "le menton", en: "chin" }, { fr: "la poitrine", en: "chest" }, { fr: "la dent", en: "tooth" },
  { fr: "la joue", en: "cheek" }, { fr: "le cerveau", en: "brain" }, { fr: "la peau", en: "skin" },
  { fr: "l'os", en: "bone" }, { fr: "le doigt", en: "finger" }, { fr: "l'estomac", en: "stomach" },
  { fr: "le ventre", en: "belly" }, { fr: "la langue", en: "tongue" }, { fr: "le cœur", en: "heart" },
  { fr: "la bouche", en: "mouth" }, { fr: "le muscle", en: "muscle" }, { fr: "le nez", en: "nose" },
  { fr: "le dos", en: "back" }, { fr: "la tête", en: "head" }, { fr: "le visage", en: "face" },
  { fr: "l'œil", en: "eye" }, { fr: "l'oreille", en: "ear" }, { fr: "les cheveux", en: "hair" },
  { fr: "le front", en: "forehead" }, { fr: "la gorge", en: "throat" }, { fr: "le cou", en: "neck" },
  { fr: "le pouce", en: "thumb" },
];

const SUBJECTS = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];

const CONJUGATIONS = {
  avoir_present: { verb: "avoir", tense: "Présent", forms: ["ai", "as", "a", "avons", "avez", "ont"] },
  etre_present: { verb: "être", tense: "Présent", forms: ["suis", "es", "est", "sommes", "êtes", "sont"] },
  aller_present: { verb: "aller", tense: "Présent", forms: ["vais", "vas", "va", "allons", "allez", "vont"] },
  parler_present: { verb: "parler", tense: "Présent", forms: ["parle", "parles", "parle", "parlons", "parlez", "parlent"] },
  finir_present: { verb: "finir", tense: "Présent", forms: ["finis", "finis", "finit", "finissons", "finissez", "finissent"] },
  vendre_present: { verb: "vendre", tense: "Présent", forms: ["vends", "vends", "vend", "vendons", "vendez", "vendent"] },
  parler_pc: { verb: "parler", tense: "Passé Composé", forms: ["ai parlé", "as parlé", "a parlé", "avons parlé", "avez parlé", "ont parlé"] },
  finir_pc: { verb: "finir", tense: "Passé Composé", forms: ["ai fini", "as fini", "a fini", "avons fini", "avez fini", "ont fini"] },
  vendre_pc: { verb: "vendre", tense: "Passé Composé", forms: ["ai vendu", "as vendu", "a vendu", "avons vendu", "avez vendu", "ont vendu"] },
  mettre_pc: { verb: "mettre", tense: "Passé Composé", forms: ["ai mis", "as mis", "a mis", "avons mis", "avez mis", "ont mis"] },
  prendre_pc: { verb: "prendre", tense: "Passé Composé", forms: ["ai pris", "as pris", "a pris", "avons pris", "avez pris", "ont pris"] },
  boire_pc: { verb: "boire", tense: "Passé Composé", forms: ["ai bu", "as bu", "a bu", "avons bu", "avez bu", "ont bu"] },
  aller_pc: { verb: "aller", tense: "Passé Composé (être)", forms: ["suis allé(e)", "es allé(e)", "est allé(e)", "sommes allé(e)s", "êtes allé(e)(s)", "sont allé(e)s"] },
  parler_fs: { verb: "parler", tense: "Futur Simple", forms: ["parlerai", "parleras", "parlera", "parlerons", "parlerez", "parleront"] },
  finir_fs: { verb: "finir", tense: "Futur Simple", forms: ["finirai", "finiras", "finira", "finirons", "finirez", "finiront"] },
  vendre_fs: { verb: "vendre", tense: "Futur Simple", forms: ["vendrai", "vendras", "vendra", "vendrons", "vendrez", "vendront"] },
  parler_imp: { verb: "parler", tense: "Imparfait", forms: ["parlais", "parlais", "parlait", "parlions", "parliez", "parlaient"] },
  finir_imp: { verb: "finir", tense: "Imparfait", forms: ["finissais", "finissais", "finissait", "finissions", "finissiez", "finissaient"] },
  vendre_imp: { verb: "vendre", tense: "Imparfait", forms: ["vendais", "vendais", "vendait", "vendions", "vendiez", "vendaient"] },
};

const FUTUR_PROCHE_DATA = [
  { verb: "manger", forms: ["vais manger", "vas manger", "va manger", "allons manger", "allez manger", "vont manger"] },
  { verb: "travailler", forms: ["vais travailler", "vas travailler", "va travailler", "allons travailler", "allez travailler", "vont travailler"] },
  { verb: "finir", forms: ["vais finir", "vas finir", "va finir", "allons finir", "allez finir", "vont finir"] },
];

const ETRE_VERBS = ["aller", "arriver", "descendre", "entrer", "monter", "mourir", "naître", "partir", "passer", "rester", "retourner", "sortir", "tomber", "venir"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s) {
  return s.toLowerCase().trim()
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .normalize("NFC");
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const palette = {
  bg: "#0f1117",
  surface: "#181b24",
  surfaceAlt: "#1e2230",
  border: "#2a2e3d",
  borderLight: "#353a4d",
  text: "#e8e6e3",
  textMuted: "#9b97a0",
  accent: "#5c7cfa",
  accentDim: "#3b5bdb",
  accentGlow: "rgba(92,124,250,0.15)",
  green: "#40c057",
  greenDim: "rgba(64,192,87,0.12)",
  red: "#fa5252",
  redDim: "rgba(250,82,82,0.12)",
  gold: "#fab005",
  goldDim: "rgba(250,176,5,0.12)",
  orange: "#fd7e14",
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Badge({ children, color = palette.accent, bg }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase",
      color: color, background: bg || `${color}22`,
    }}>{children}</span>
  );
}

function ConjTable({ verb, tense, forms }) {
  return (
    <div style={{
      background: palette.surface, borderRadius: 12, border: `1px solid ${palette.border}`,
      overflow: "hidden", minWidth: 240,
    }}>
      <div style={{
        padding: "10px 16px", background: palette.accentGlow,
        borderBottom: `1px solid ${palette.border}`, display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontFamily: "'DM Serif Display', serif", fontSize: 17 }}>{verb}</span>
        <Badge>{tense}</Badge>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {SUBJECTS.map((s, i) => (
            <tr key={i} style={{ borderBottom: i < 5 ? `1px solid ${palette.border}` : "none" }}>
              <td style={{ padding: "7px 16px", color: palette.textMuted, fontSize: 13, width: 90, fontFamily: "monospace" }}>{s}</td>
              <td style={{ padding: "7px 16px", fontWeight: 600, fontSize: 14 }}>{forms[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TAB: REVIEW ────────────────────────────────────────────────────────────

function ReviewTab() {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{
        fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 12,
        borderBottom: `2px solid ${palette.accent}`, paddingBottom: 6, display: "inline-block",
      }}>{title}</h3>
      <div style={{ lineHeight: 1.75, color: palette.text, fontSize: 14 }}>{children}</div>
    </div>
  );

  const Tip = ({ children }) => (
    <div style={{
      padding: "12px 16px", borderRadius: 10, background: palette.goldDim,
      border: `1px solid ${palette.gold}33`, marginTop: 10, marginBottom: 10,
      fontSize: 13, color: palette.gold, display: "flex", gap: 8, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 16 }}>💡</span><span>{children}</span>
    </div>
  );

  const OVERVIEW = [
    { tense: "Présent", er: "je touche", ir: "je finis", re: "je vends", desc: "Right now" },
    { tense: "Passé Composé", er: "j'ai touché", ir: "j'ai fini", re: "j'ai vendu", desc: "Completed past" },
    { tense: "Imparfait", er: "je touchais", ir: "je finissais", re: "je vendais", desc: "Ongoing/habitual past" },
    { tense: "Futur Proche", er: "je vais toucher", ir: "je vais finir", re: "je vais vendre", desc: "Going to (near future)" },
    { tense: "Futur Simple", er: "je toucherai", ir: "je finirai", re: "je vendrai", desc: "Will (simple future)" },
  ];

  const hlVerb = (text) => {
    const parts = text.split(/(?<=\s)|(?=\s)/);
    return parts.map((p, i) => {
      if (["je", "j'ai", "j'", "je vais"].includes(p.trim())) return <span key={i} style={{ color: palette.textMuted }}>{p}</span>;
      return <span key={i} style={{ color: palette.accent, fontWeight: 700 }}>{p}</span>;
    });
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* ─── QUICK OVERVIEW TABLE ─── */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 6,
          borderBottom: `2px solid ${palette.gold}`, paddingBottom: 6, display: "inline-block",
          color: palette.gold,
        }}>⚡ Quick Overview — All 5 Tenses at a Glance</h3>
        <p style={{ color: palette.textMuted, fontSize: 13, marginBottom: 14 }}>
          One table to see every tense side-by-side. Master this and you've got the whole test mapped out.
        </p>
        <div style={{
          borderRadius: 14, overflow: "hidden", border: `1px solid ${palette.border}`,
          background: palette.surface,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: palette.surfaceAlt }}>
                <th style={{ padding: "10px 14px", textAlign: "left", color: palette.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", borderBottom: `1px solid ${palette.border}` }}>Tense</th>
                <th style={{ padding: "10px 14px", textAlign: "left", color: palette.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", borderBottom: `1px solid ${palette.border}` }}>-ER (toucher)</th>
                <th style={{ padding: "10px 14px", textAlign: "left", color: palette.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", borderBottom: `1px solid ${palette.border}` }}>-IR (finir)</th>
                <th style={{ padding: "10px 14px", textAlign: "left", color: palette.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", borderBottom: `1px solid ${palette.border}` }}>-RE (vendre)</th>
              </tr>
            </thead>
            <tbody>
              {OVERVIEW.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < OVERVIEW.length - 1 ? `1px solid ${palette.border}` : "none" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13 }}>
                    <div>{row.tense}</div>
                    <div style={{ fontSize: 10, color: palette.textMuted, fontWeight: 400, marginTop: 2 }}>{row.desc}</div>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "'DM Sans', sans-serif" }}>{hlVerb(row.er)}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "'DM Sans', sans-serif" }}>{hlVerb(row.ir)}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "'DM Sans', sans-serif" }}>{hlVerb(row.re)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formation rules mini-reference */}
        <div style={{
          marginTop: 14, padding: "14px 18px", borderRadius: 12,
          background: palette.accentGlow, border: `1px solid ${palette.accent}33`,
          fontSize: 13, lineHeight: 1.8,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: palette.accent }}>🔑 Formation Cheat Sheet</div>
          <div><strong>Présent:</strong> stem + tense endings (-e/-es/-e/-ons/-ez/-ent for -ER)</div>
          <div><strong>Passé Composé:</strong> avoir/être (present) + past participle (-é / -i / -u)</div>
          <div><strong>Imparfait:</strong> nous-present stem + <span style={{ fontFamily: "monospace", color: palette.accent }}>-ais, -ais, -ait, -ions, -iez, -aient</span></div>
          <div><strong>Futur Proche:</strong> aller (present) + infinitive</div>
          <div><strong>Futur Simple:</strong> infinitive (drop -e for -RE) + <span style={{ fontFamily: "monospace", color: palette.accent }}>-ai, -as, -a, -ons, -ez, -ont</span></div>
        </div>
      </div>

      <Section title="1. Avoir & Être — Présent">
        <p>These are the two most important verbs in French. You need them for everything — especially passé composé.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
          <ConjTable {...CONJUGATIONS.avoir_present} />
          <ConjTable {...CONJUGATIONS.etre_present} />
        </div>
        <Tip>Mnemonic for être: <strong>S</strong>uis, e<strong>S</strong>, es<strong>T</strong> — <strong>S</strong>ommes, ê<strong>T</strong>es, son<strong>T</strong>. The consonants S-S-T-S-T-T.</Tip>
      </Section>

      <Section title="2. Futur Proche (aller + infinitif)">
        <p>To say what you're <em>going to do</em>, conjugate <strong>aller</strong> in present tense + the infinitive of the action verb.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
          <ConjTable {...CONJUGATIONS.aller_present} />
        </div>
        <p style={{ marginTop: 12 }}>Examples: <em>je <strong>vais manger</strong></em> (I'm going to eat), <em>nous <strong>allons travailler</strong></em> (we're going to work), <em>il <strong>va voter</strong></em> (he's going to vote).</p>
        <Tip>Futur proche = present tense of ALLER + infinitive. That's it. No conjugation on the second verb!</Tip>
      </Section>

      <Section title="3. Passé Composé">
        <p>Two parts: <strong>auxiliary</strong> (avoir or être in present) + <strong>past participle</strong>.</p>
        <p style={{ marginTop: 8 }}><strong>Regular past participles:</strong></p>
        <ul style={{ paddingLeft: 20, margin: "4px 0" }}>
          <li>-ER → -é (parler → parlé)</li>
          <li>-IR → -i (finir → fini)</li>
          <li>-RE → -u (vendre → vendu)</li>
        </ul>
        <p style={{ marginTop: 8 }}><strong>3 irregular ones for the test:</strong></p>
        <ul style={{ paddingLeft: 20, margin: "4px 0" }}>
          <li>mettre → <strong>mis</strong> (j'ai mis)</li>
          <li>prendre → <strong>pris</strong> (j'ai pris)</li>
          <li>boire → <strong>bu</strong> (j'ai bu)</li>
        </ul>
        <Tip><strong>Être verbs</strong> (DR MRS VANDERTRAMP): {ETRE_VERBS.join(", ")}. With être, the past participle agrees in gender/number with the subject!</Tip>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
          <ConjTable {...CONJUGATIONS.mettre_pc} />
          <ConjTable {...CONJUGATIONS.prendre_pc} />
          <ConjTable {...CONJUGATIONS.boire_pc} />
          <ConjTable {...CONJUGATIONS.aller_pc} />
        </div>
      </Section>

      <Section title="4. Futur Simple">
        <p><strong>Stem:</strong> the infinitive (for -RE verbs, drop the final -e).</p>
        <p><strong>Endings</strong> (same for all groups): <span style={{ fontFamily: "monospace", color: palette.accent }}>-ai, -as, -a, -ons, -ez, -ont</span></p>
        <Tip>Notice the futur simple endings look like avoir in present tense: ai, as, a, (av)ons, (av)ez, ont!</Tip>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
          <ConjTable {...CONJUGATIONS.parler_fs} />
          <ConjTable {...CONJUGATIONS.finir_fs} />
          <ConjTable {...CONJUGATIONS.vendre_fs} />
        </div>
      </Section>

      <Section title="5. Imparfait">
        <p><strong>Stem:</strong> take the <em>nous</em> form of the present tense, drop <em>-ons</em>.</p>
        <p><strong>Endings:</strong> <span style={{ fontFamily: "monospace", color: palette.accent }}>-ais, -ais, -ait, -ions, -iez, -aient</span></p>
        <Tip>All imparfait endings have the letters <strong>ai</strong> in them (except nous/vous which add i → -ions, -iez). And 3 of them sound identical: -ais, -ais, -ait.</Tip>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
          <ConjTable {...CONJUGATIONS.parler_imp} />
          <ConjTable {...CONJUGATIONS.finir_imp} />
          <ConjTable {...CONJUGATIONS.vendre_imp} />
        </div>
      </Section>

      <Section title="6. Les Parties du Corps">
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8, marginTop: 8,
        }}>
          {BODY_PARTS.map((bp, i) => (
            <div key={i} style={{
              padding: "8px 14px", background: palette.surfaceAlt, borderRadius: 8,
              border: `1px solid ${palette.border}`, display: "flex", justifyContent: "space-between",
              fontSize: 13,
            }}>
              <span style={{ fontWeight: 600 }}>{bp.fr}</span>
              <span style={{ color: palette.textMuted }}>{bp.en}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── TAB: TABLES ────────────────────────────────────────────────────────────

function TablesTab() {
  const groups = {
    "Présent": ["avoir_present", "etre_present", "aller_present", "parler_present", "finir_present", "vendre_present"],
    "Passé Composé": ["parler_pc", "finir_pc", "vendre_pc", "mettre_pc", "prendre_pc", "boire_pc", "aller_pc"],
    "Futur Simple": ["parler_fs", "finir_fs", "vendre_fs"],
    "Imparfait": ["parler_imp", "finir_imp", "vendre_imp"],
  };
  return (
    <div>
      {Object.entries(groups).map(([label, keys]) => (
        <div key={label} style={{ marginBottom: 36 }}>
          <h3 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: 20,
            marginBottom: 14, color: palette.accent,
          }}>{label}</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {keys.map(k => <ConjTable key={k} {...CONJUGATIONS[k]} />)}
          </div>
        </div>
      ))}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, marginBottom: 14, color: palette.accent }}>Futur Proche</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {FUTUR_PROCHE_DATA.map(fp => (
            <ConjTable key={fp.verb} verb={`aller + ${fp.verb}`} tense="Futur Proche" forms={fp.forms} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: FLASHCARDS ────────────────────────────────────────────────────────

function FlashcardsTab() {
  const [mode, setMode] = useState("body"); // body | conj
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const generateBodyCards = useCallback(() => {
    return shuffle(BODY_PARTS).map(bp => ({ front: bp.en, back: bp.fr, type: "body" }));
  }, []);

  const generateConjCards = useCallback(() => {
    const out = [];
    Object.values(CONJUGATIONS).forEach(c => {
      const si = Math.floor(Math.random() * 6);
      out.push({
        front: `${c.verb} (${c.tense})\n${SUBJECTS[si]}`,
        back: c.forms[si],
        type: "conj",
      });
    });
    return shuffle(out);
  }, []);

  useEffect(() => {
    setCards(mode === "body" ? generateBodyCards() : generateConjCards());
    setIdx(0); setFlipped(false); setScore({ correct: 0, wrong: 0 });
  }, [mode, generateBodyCards, generateConjCards]);

  const current = cards[idx];
  const done = idx >= cards.length;

  const advance = (correct) => {
    setScore(s => ({ ...s, [correct ? "correct" : "wrong"]: s[correct ? "correct" : "wrong"] + 1 }));
    setFlipped(false);
    setIdx(i => i + 1);
  };

  const restart = () => {
    setCards(mode === "body" ? generateBodyCards() : generateConjCards());
    setIdx(0); setFlipped(false); setScore({ correct: 0, wrong: 0 });
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
        {[["body", "Body Parts"], ["conj", "Conjugations"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            padding: "8px 20px", borderRadius: 99, border: `1px solid ${palette.border}`,
            background: mode === k ? palette.accent : "transparent",
            color: mode === k ? "#fff" : palette.textMuted,
            cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all .2s",
          }}>{l}</button>
        ))}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: 12,
        fontSize: 13, color: palette.textMuted,
      }}>
        <span>Card {Math.min(idx + 1, cards.length)} / {cards.length}</span>
        <span>
          <span style={{ color: palette.green }}>✓ {score.correct}</span>
          {" · "}
          <span style={{ color: palette.red }}>✗ {score.wrong}</span>
        </span>
      </div>

      {done ? (
        <div style={{
          textAlign: "center", padding: 48, background: palette.surface,
          borderRadius: 16, border: `1px solid ${palette.border}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Terminé !</div>
          <div style={{ fontSize: 15, color: palette.textMuted, marginBottom: 20 }}>
            {score.correct} / {score.correct + score.wrong} correct ({Math.round(score.correct / (score.correct + score.wrong) * 100)}%)
          </div>
          <button onClick={restart} style={{
            padding: "10px 28px", borderRadius: 99, border: "none",
            background: palette.accent, color: "#fff", fontWeight: 700,
            cursor: "pointer", fontSize: 14,
          }}>Recommencer</button>
        </div>
      ) : current && (
        <>
          <div onClick={() => setFlipped(f => !f)} style={{
            background: palette.surface, borderRadius: 16, border: `1px solid ${palette.border}`,
            minHeight: 220, display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", cursor: "pointer",
            padding: 32, transition: "all .2s", userSelect: "none",
            boxShadow: flipped ? `0 0 30px ${palette.accentGlow}` : "none",
          }}>
            <div style={{ fontSize: 12, color: palette.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              {flipped ? "Answer" : "Question"} · tap to flip
            </div>
            <div style={{
              fontSize: current.type === "conj" && !flipped ? 16 : 28,
              fontWeight: 700, textAlign: "center", whiteSpace: "pre-line",
              fontFamily: "'DM Serif Display', serif",
              color: flipped ? palette.accent : palette.text,
            }}>
              {flipped ? current.back : current.front}
            </div>
          </div>
          {flipped && (
            <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
              <button onClick={() => advance(false)} style={{
                flex: 1, maxWidth: 180, padding: "12px 0", borderRadius: 10, border: "none",
                background: palette.redDim, color: palette.red, fontWeight: 700, cursor: "pointer", fontSize: 14,
              }}>✗ Incorrect</button>
              <button onClick={() => advance(true)} style={{
                flex: 1, maxWidth: 180, padding: "12px 0", borderRadius: 10, border: "none",
                background: palette.greenDim, color: palette.green, fontWeight: 700, cursor: "pointer", fontSize: 14,
              }}>✓ Correct</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── TAB: PRACTICE ──────────────────────────────────────────────────────────

function generatePracticeQs() {
  const qs = [];

  // Type 1: Fill-in conjugation
  const conjKeys = Object.keys(CONJUGATIONS);
  for (let i = 0; i < 8; i++) {
    const k = conjKeys[Math.floor(Math.random() * conjKeys.length)];
    const c = CONJUGATIONS[k];
    const si = Math.floor(Math.random() * 6);
    qs.push({
      type: "fill",
      prompt: `Conjugate «${c.verb}» in ${c.tense} for "${SUBJECTS[si]}":`,
      answer: c.forms[si],
    });
  }

  // Type 2: Translate body part
  const bps = shuffle(BODY_PARTS).slice(0, 6);
  bps.forEach(bp => {
    if (Math.random() > 0.5) {
      qs.push({ type: "fill", prompt: `Translate to French: "${bp.en}"`, answer: bp.fr });
    } else {
      qs.push({ type: "fill", prompt: `Translate to English: "${bp.fr}"`, answer: bp.en });
    }
  });

  // Type 3: MC — which auxiliary
  qs.push({
    type: "mc",
    prompt: 'Which auxiliary does "aller" use in passé composé?',
    options: ["avoir", "être"],
    answer: "être",
  });
  qs.push({
    type: "mc",
    prompt: 'What is the past participle of "boire"?',
    options: ["bu", "boi", "boiré", "boire"],
    answer: "bu",
  });
  qs.push({
    type: "mc",
    prompt: "What are the futur simple endings?",
    options: ["-ai, -as, -a, -ons, -ez, -ont", "-e, -es, -e, -ons, -ez, -ent", "-ais, -ais, -ait, -ions, -iez, -aient"],
    answer: "-ai, -as, -a, -ons, -ez, -ont",
  });
  qs.push({
    type: "mc",
    prompt: "How do you form the imparfait stem?",
    options: [
      "Infinitive of the verb",
      "Nous form of présent minus -ons",
      "Past participle plus ending",
    ],
    answer: "Nous form of présent minus -ons",
  });

  return shuffle(qs);
}

function PracticeTab() {
  const [questions, setQuestions] = useState(() => generatePracticeQs());
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});

  const check = (i) => {
    const q = questions[i];
    const userAns = normalize(answers[i] || "");
    const correct = normalize(q.answer);
    setChecked(c => ({ ...c, [i]: userAns === correct }));
  };

  const regenerate = () => {
    setQuestions(generatePracticeQs());
    setAnswers({});
    setChecked({});
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ color: palette.textMuted, fontSize: 13 }}>{questions.length} questions · type your answers and check</span>
        <button onClick={regenerate} style={{
          padding: "6px 16px", borderRadius: 99, border: `1px solid ${palette.border}`,
          background: "transparent", color: palette.textMuted, cursor: "pointer", fontSize: 12,
        }}>🔄 New Set</button>
      </div>

      {questions.map((q, i) => {
        const isChecked = checked[i] !== undefined;
        const isCorrect = checked[i];
        return (
          <div key={i} style={{
            marginBottom: 16, padding: 16, borderRadius: 12,
            background: palette.surface, border: `1px solid ${isChecked ? (isCorrect ? palette.green : palette.red) + "55" : palette.border}`,
          }}>
            <div style={{ fontSize: 14, marginBottom: 10, fontWeight: 500 }}>
              <span style={{ color: palette.textMuted, marginRight: 8 }}>Q{i + 1}.</span>
              {q.prompt}
            </div>
            {q.type === "fill" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={answers[i] || ""}
                  onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && check(i)}
                  disabled={isChecked}
                  placeholder="Your answer..."
                  style={{
                    flex: 1, padding: "8px 14px", borderRadius: 8, border: `1px solid ${palette.border}`,
                    background: palette.surfaceAlt, color: palette.text, fontSize: 14, outline: "none",
                  }}
                />
                {!isChecked && (
                  <button onClick={() => check(i)} style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: palette.accent, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13,
                  }}>Check</button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {q.options.map(opt => {
                  const selected = answers[i] === opt;
                  const showResult = isChecked;
                  const isRight = opt === q.answer;
                  return (
                    <button key={opt} onClick={() => {
                      if (!isChecked) {
                        setAnswers(a => ({ ...a, [i]: opt }));
                        setChecked(c => ({ ...c, [i]: opt === q.answer }));
                      }
                    }} style={{
                      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                      border: `1px solid ${showResult ? (isRight ? palette.green : (selected ? palette.red : palette.border)) : (selected ? palette.accent : palette.border)}`,
                      background: showResult ? (isRight ? palette.greenDim : (selected && !isRight ? palette.redDim : "transparent")) : (selected ? palette.accentGlow : "transparent"),
                      color: palette.text, cursor: isChecked ? "default" : "pointer",
                    }}>{opt}</button>
                  );
                })}
              </div>
            )}
            {isChecked && !isCorrect && (
              <div style={{ marginTop: 8, fontSize: 13, color: palette.red }}>
                Correct answer: <strong style={{ color: palette.green }}>{q.answer}</strong>
              </div>
            )}
            {isChecked && isCorrect && (
              <div style={{ marginTop: 8, fontSize: 13, color: palette.green }}>✓ Correct!</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB: MOCK TEST ─────────────────────────────────────────────────────────

function generateMockTest() {
  const qs = [];

  // Section A: Avoir & Être (4 qs)
  ["avoir_present", "etre_present"].forEach(k => {
    const c = CONJUGATIONS[k];
    for (let x = 0; x < 2; x++) {
      const si = Math.floor(Math.random() * 6);
      qs.push({ section: "A", prompt: `${SUBJECTS[si]} ______ (${c.verb}, présent)`, answer: c.forms[si] });
    }
  });

  // Section B: Futur Proche (3 qs)
  const verbs = ["danser", "choisir", "attendre"];
  verbs.forEach(v => {
    const si = Math.floor(Math.random() * 6);
    const aller = CONJUGATIONS.aller_present.forms[si];
    qs.push({ section: "B", prompt: `${SUBJECTS[si]} ______ ______ (${v}, futur proche)`, answer: `${aller} ${v}` });
  });

  // Section C: Passé Composé (6 qs)
  ["parler_pc", "finir_pc", "vendre_pc", "mettre_pc", "prendre_pc", "boire_pc"].forEach(k => {
    const c = CONJUGATIONS[k];
    const si = Math.floor(Math.random() * 6);
    qs.push({ section: "C", prompt: `${SUBJECTS[si]} ______ (${c.verb}, passé composé)`, answer: c.forms[si] });
  });

  // Section D: Futur Simple (3 qs)
  ["parler_fs", "finir_fs", "vendre_fs"].forEach(k => {
    const c = CONJUGATIONS[k];
    const si = Math.floor(Math.random() * 6);
    qs.push({ section: "D", prompt: `${SUBJECTS[si]} ______ (${c.verb}, futur simple)`, answer: c.forms[si] });
  });

  // Section E: Body Parts (6 qs)
  shuffle(BODY_PARTS).slice(0, 6).forEach(bp => {
    if (Math.random() > 0.5) {
      qs.push({ section: "E", prompt: `English → French: "${bp.en}"`, answer: bp.fr });
    } else {
      qs.push({ section: "E", prompt: `French → English: "${bp.fr}"`, answer: bp.en });
    }
  });

  // Section F: MC
  qs.push({
    section: "F", type: "mc",
    prompt: 'Quel auxiliaire utilise le verbe "partir" au passé composé ?',
    options: ["avoir", "être"], answer: "être",
  });
  qs.push({
    section: "F", type: "mc",
    prompt: "Le participe passé de «mettre» est :",
    options: ["metté", "mis", "mettu", "mettis"], answer: "mis",
  });

  return qs;
}

function MockTestTab() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!started || submitted) return;
    const iv = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [started, submitted]);

  const start = () => {
    setQuestions(generateMockTest());
    setAnswers({});
    setSubmitted(false);
    setTimer(0);
    setStarted(true);
  };

  const submit = () => setSubmitted(true);

  const results = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    questions.forEach((q, i) => {
      if (normalize(answers[i] || "") === normalize(q.answer)) correct++;
    });
    return { correct, total: questions.length, pct: Math.round(correct / questions.length * 100) };
  }, [submitted, questions, answers]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const sectionNames = { A: "Avoir & Être", B: "Futur Proche", C: "Passé Composé", D: "Futur Simple", E: "Vocabulaire — Corps", F: "Questions à choix multiples" };

  if (!started) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 8 }}>Test Final — French 2</h2>
        <p style={{ color: palette.textMuted, marginBottom: 24, fontSize: 14 }}>
          {24} questions · timed · covers all grammar + vocabulary
        </p>
        <button onClick={start} style={{
          padding: "14px 40px", borderRadius: 99, border: "none",
          background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: "pointer",
        }}>Commencer le test</button>
      </div>
    );
  }

  let currentSection = "";

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10, padding: "12px 0",
        background: palette.bg, display: "flex", justifyContent: "space-between",
        alignItems: "center", borderBottom: `1px solid ${palette.border}`, marginBottom: 20,
      }}>
        <span style={{ fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>
          {submitted ? "Résultats" : "Test en cours..."}
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge color={palette.gold}>⏱ {formatTime(timer)}</Badge>
          {!submitted && (
            <button onClick={submit} style={{
              padding: "6px 20px", borderRadius: 99, border: "none",
              background: palette.green, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>Soumettre</button>
          )}
          {submitted && (
            <button onClick={start} style={{
              padding: "6px 20px", borderRadius: 99, border: "none",
              background: palette.accent, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>Reprendre</button>
          )}
        </div>
      </div>

      {submitted && results && (
        <div style={{
          textAlign: "center", padding: 28, marginBottom: 24, borderRadius: 16,
          background: results.pct >= 80 ? palette.greenDim : results.pct >= 60 ? palette.goldDim : palette.redDim,
          border: `1px solid ${(results.pct >= 80 ? palette.green : results.pct >= 60 ? palette.gold : palette.red) + "44"}`,
        }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: results.pct >= 80 ? palette.green : results.pct >= 60 ? palette.gold : palette.red }}>
            {results.pct}%
          </div>
          <div style={{ color: palette.textMuted, fontSize: 14 }}>
            {results.correct} / {results.total} correct · {formatTime(timer)}
          </div>
        </div>
      )}

      {questions.map((q, i) => {
        const showHeader = q.section !== currentSection;
        if (showHeader) currentSection = q.section;
        const isChecked = submitted;
        const userAns = normalize(answers[i] || "");
        const isCorrect = userAns === normalize(q.answer);

        return (
          <div key={i}>
            {showHeader && (
              <h3 style={{
                fontFamily: "'DM Serif Display', serif", fontSize: 17, color: palette.accent,
                marginTop: 24, marginBottom: 12, paddingBottom: 6,
                borderBottom: `1px solid ${palette.border}`,
              }}>Section {q.section}: {sectionNames[q.section]}</h3>
            )}
            <div style={{
              marginBottom: 12, padding: 14, borderRadius: 10,
              background: palette.surface,
              border: `1px solid ${isChecked ? (isCorrect ? palette.green : palette.red) + "44" : palette.border}`,
            }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: palette.textMuted }}>{i + 1}.</span> {q.prompt}
              </div>
              {q.type === "mc" ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {q.options.map(opt => {
                    const sel = answers[i] === opt;
                    const right = opt === q.answer;
                    return (
                      <button key={opt} onClick={() => !submitted && setAnswers(a => ({ ...a, [i]: opt }))} style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 13,
                        border: `1px solid ${isChecked ? (right ? palette.green : (sel ? palette.red : palette.border)) : (sel ? palette.accent : palette.border)}`,
                        background: isChecked ? (right ? palette.greenDim : (sel && !right ? palette.redDim : "transparent")) : (sel ? palette.accentGlow : "transparent"),
                        color: palette.text, cursor: submitted ? "default" : "pointer",
                      }}>{opt}</button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={answers[i] || ""}
                  onChange={e => !submitted && setAnswers(a => ({ ...a, [i]: e.target.value }))}
                  disabled={submitted}
                  placeholder="..."
                  style={{
                    width: "100%", padding: "7px 12px", borderRadius: 8,
                    border: `1px solid ${palette.border}`, background: palette.surfaceAlt,
                    color: palette.text, fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                />
              )}
              {isChecked && !isCorrect && (
                <div style={{ marginTop: 6, fontSize: 12, color: palette.red }}>
                  → <strong style={{ color: palette.green }}>{q.answer}</strong>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "review", label: "Review", icon: "📖" },
  { id: "tables", label: "Tables", icon: "📊" },
  { id: "flash", label: "Flashcards", icon: "🃏" },
  { id: "practice", label: "Practice", icon: "✏️" },
  { id: "test", label: "Mock Test", icon: "📝" },
];

export default function App() {
  const [tab, setTab] = useState("review");

  return (
    <div style={{
      minHeight: "100vh", background: palette.bg, color: palette.text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "32px 24px 20px", borderBottom: `1px solid ${palette.border}`,
        background: `linear-gradient(180deg, ${palette.accentGlow} 0%, transparent 100%)`,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>🇫🇷</span>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif", fontSize: 28, margin: 0,
              background: `linear-gradient(135deg, ${palette.accent}, #a78bfa)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>French 2 — Final Review</h1>
          </div>
          <p style={{ color: palette.textMuted, fontSize: 13, margin: 0 }}>
            Avoir/être · futur proche · passé composé · futur simple · imparfait · les parties du corps
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        borderBottom: `1px solid ${palette.border}`, background: palette.surface,
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto", display: "flex", gap: 0,
          overflowX: "auto", padding: "0 16px",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 18px", border: "none", background: "transparent",
              color: tab === t.id ? palette.accent : palette.textMuted,
              fontWeight: tab === t.id ? 700 : 500, fontSize: 13,
              cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: tab === t.id ? `2px solid ${palette.accent}` : "2px solid transparent",
              transition: "all .15s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 64px" }}>
        {tab === "review" && <ReviewTab />}
        {tab === "tables" && <TablesTab />}
        {tab === "flash" && <FlashcardsTab />}
        {tab === "practice" && <PracticeTab />}
        {tab === "test" && <MockTestTab />}
      </div>
    </div>
  );
}
