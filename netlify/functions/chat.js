exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { message, history } = JSON.parse(event.body || '{}');
  if (!message) return { statusCode: 400, body: 'No message' };

  const SYSTEM_PROMPT = `Είσαι ο ψηφιακός βοηθός του τεχνικού γραφείου PA Creative House στην Καλαμάτα. Το γραφείο ανήκει στον Παναγιώτη Αργύρη, Πολιτικό Μηχανικό ΤΕ.

ΠΛΗΡΟΦΟΡΙΕΣ ΓΡΑΦΕΙΟΥ:
- Όνομα: PA Creative House
- Ιδιοκτήτης: Παναγιώτης Αργύρης, Πολιτικός Μηχανικός ΤΕ
- Διεύθυνση: Φαρών 155, Καλαμάτα 24100
- Τηλέφωνο: 27210 90509
- Email: info@creativehouse.gr
- Ώρες: Δευτέρα–Παρασκευή 09:00–17:00
- Περιοχές: Ολόκληρη η Μεσσηνία (Καλαμάτα, Μεσσήνη, Κυπαρισσία, Πύλος, Φιλιατρά κλπ). Κατόπιν συνεννόησης και εκτός Μεσσηνίας.

ΥΠΗΡΕΣΙΕΣ & ΧΡΟΝΟΙ:
1. Οικοδομικές Άδειες & Στατικές Μελέτες — 2–6 μήνες
2. Τακτοποίηση Αυθαιρέτων (Ν.4495/2017) — 1–3 μήνες
3. Ηλεκτρονική Ταυτότητα Κτιρίου — 2–4 εβδομάδες
4. Εγκρίσεις Εργασιών Μικρής Κλίμακας — 5–15 εργάσιμες
5. Τοπογραφικά Διαγράμματα (ΕΓΣΑ '87) — 3–7 εργάσιμες
6. Ενεργειακές Επιθεωρήσεις (ΠΕΑ) — 3–5 εργάσιμες
7. Πρόγραμμα Εξοικονομώ (εγκεκριμένος φορέας) — 2–4 μήνες, επιδότηση έως 75%
8. Τεχνικός Ασφάλειας
9. Interior Design
10. Ολική & Μερική Ανακαίνιση
11. Κατασκευές & Επίβλεψη Έργων
12. Άδειες Λειτουργίας Επιχειρήσεων

ΤΙΜΕΣ:
Όταν ρωτούν για κόστος, πες ότι η τιμή εξαρτάται από το μέγεθος και τις ιδιαιτερότητες κάθε έργου, και κάλεσέ τους να επικοινωνήσουν για δωρεάν εκτίμηση. Μην αναφέρεις συγκεκριμένα νούμερα.

ΚΑΝΟΝΕΣ ΣΥΜΠΕΡΙΦΟΡΑΣ:
- Μίλα στα ελληνικά πάντα
- Ύφος: ζεστό αλλά επαγγελματικό — σαν ένας έμπειρος συνεργάτης που θέλει να βοηθήσει
- Απαντές σύντομα και ουσιαστικά (2–4 προτάσεις max)
- Στο τέλος κάθε απάντησης, αν είναι σχετικό, κάλεσε τον πελάτη να επικοινωνήσει: τηλέφωνο 27210 90509 ή WhatsApp
- Αν ρωτήσουν κάτι που δεν γνωρίζεις, πες ότι θα χαρείς να το συζητήσουν με τον Παναγιώτη άμεσα
- ΜΗΝ απαντάς σε ερωτήσεις άσχετες με ακίνητα, μηχανική ή το γραφείο`;

  const messages = [];
  if (history && Array.isArray(history)) {
    history.forEach(h => messages.push(h));
  }
  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Συγγνώμη, δεν μπόρεσα να απαντήσω. Καλέστε μας στο 27210 90509.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Κάτι πήγε στραβά. Καλέστε μας στο 27210 90509.' })
    };
  }
};
