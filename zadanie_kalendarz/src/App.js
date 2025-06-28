import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState, useEffect, useRef } from 'react';
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';


function TerminyPrzedstawien() {
  const kalendarzRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [popupWydarzenie, setPopupWydarzenie] = useState(null);
  const [czyAdmin, setCzyAdmin] = useState(false);
  const [wybraneWydarzenie, setWybraneWydarzenie] = useState(null);
  const [wydarzenia, setWydarzenia] = useState(() => {
    const zapisane = localStorage.getItem("wydarzenia");
    return zapisane ? JSON.parse(zapisane) : [];
  });
  const [rezerwacje, setRezerwacje] = useState(() => {
    const zapisane = localStorage.getItem("rezerwacje");
    return zapisane ? JSON.parse(zapisane) : [];
  });
  useEffect(() => {
    localStorage.setItem("wydarzenia", JSON.stringify(wydarzenia));
  }, [wydarzenia]);
  useEffect(() => {
    localStorage.setItem("rezerwacje", JSON.stringify(rezerwacje));
  }, [rezerwacje]);

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom,rgb(80, 55, 23),rgb(139, 2, 2))',
        height: '100vh',
        overflow: 'auto'

      }}
    >
    {!czyAdmin ? 
      (
        <button
         onClick={() => 
          {
            const kod = prompt("Kod użytkownika:");
            if (kod === "admin123") 
              {
                setCzyAdmin(true);
                alert("Tryb zarządzania aktywny.");
              } else 
              {
                alert("Nieprawidłowy kod.");
              }
          }}
        >
          Zarządzaj
        </button>
      ) : (
        <button
          onClick={() => {
            setCzyAdmin(false);
            alert("Opuszczono tryb zarządzania.");
          }}
        >
          Opuść tryb zarządzania
        </button>
        
      )}
      {wybraneWydarzenie && (
        <div style={{
          position: 'relative',
          marginTop: '20px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <button
            onClick={() => setWybraneWydarzenie(null)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            title="Zamknij"
          >
            ✖
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const imie = e.target.elements.imie.value.trim();
              const nazwisko = e.target.elements.nazwisko.value.trim();
              const email = e.target.elements.email.value.trim();

              if (!imie || !nazwisko || !email) {
                alert("Uzupełnij wszystkie pola.");
                return;
              }

              const liczbaIstniejacych = rezerwacje.filter(r => {
                const d1 = new Date(r.data).toISOString().slice(0, 16);
                const d2 = new Date(wybraneWydarzenie.data).toISOString().slice(0, 16);
                return r.tytul === wybraneWydarzenie.tytul && d1 === d2;
              }).length;

              if (liczbaIstniejacych >= 2) {
                alert("Osiągnięto limit rezerwacji dla wybranego wydarzenia.");
                return;
              }

              const nowaRezerwacja = {
                imie, nazwisko, email,
                tytul: wybraneWydarzenie.tytul,
                data: wybraneWydarzenie.data
              };
              setRezerwacje([...rezerwacje, nowaRezerwacja]);
              alert("Rezerwacja zapisana!");
              setWybraneWydarzenie(null);
            }}
          >
            <h2>Rezerwacja na: {wybraneWydarzenie.tytul}</h2>
            <p>
              Dnia: {
                (() => {
                  const start = new Date(wybraneWydarzenie.data);
                  const wydarzenie = wydarzenia.find(w =>
                    w.title === wybraneWydarzenie.tytul &&
                    new Date(w.start).getTime() === start.getTime()
                  );
                  if (!wydarzenie) return "Nieznana data";

                  const f = (n) => n.toString().padStart(2, '0');
                  const dzien = f(start.getDate());
                  const miesiac = f(start.getMonth() + 1);
                  const rok = start.getFullYear();
                  const godzinaStart = `${f(start.getHours())}:${f(start.getMinutes())}`;
                  const koniec = new Date(wydarzenie.end);
                  const godzinaKoniec = `${f(koniec.getHours())}:${f(koniec.getMinutes())}`;

                  return (
                    <>
                      <strong>{dzien}.{miesiac}.{rok}</strong> <strong>w godzinach:</strong> <strong>{godzinaStart} - {godzinaKoniec}</strong>
                    </>
                  );
                })()
              }
            </p>

            <input type="text" name="imie" placeholder="Imię" required /> <br />
            <input type="text" name="nazwisko" placeholder="Nazwisko" required /> <br />
            <input type="email" name="email" placeholder="Email" required /> <br />

            <button type="submit">Zarezerwuj</button>
          </form>
        </div>
      )}

      {czyAdmin && (
        <button
          onClick={() => {
            const potwierdzenie = window.confirm("Czy na pewno chcesz usunąć wszystkie rezerwacje?");
            if (potwierdzenie) {
              setRezerwacje([]);
              localStorage.removeItem("rezerwacje");
              alert("Wszystkie rezerwacje zostały usunięte.");
            }
          }}
          style={{ marginLeft: '10px' }}
        >
          Usuń wszystkie rezerwacje
        </button>
      )}

      <h1 style={{ textAlign: 'center', color: 'white' }}>Rezerwacje</h1>
      <div style={{ display: 'flex'}}>
        <div style={{ padding: '2%' }}></div>
        <div style={{ flexGrow: 1, color: 'white' }}>

          {popupWydarzenie && (
            <div style={{
              position: 'fixed',
              top: '35%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '20px',
              color: 'black',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 1000
            }}>
              <p>Wydarzenie: {popupWydarzenie.title}</p>

              <button onClick={() => {
                const rezerwacjeDoPobrania = rezerwacje.filter(r =>
                  r.tytul === popupWydarzenie.title &&
                  r.data === popupWydarzenie.startStr
                );

                if (rezerwacjeDoPobrania.length === 0) {
                  alert("Brak rezerwacji dla tego wydarzenia.");
                  setPopupWydarzenie(null);
                  return;
                }

                const tekst = rezerwacjeDoPobrania.map(r =>
                  `• ${r.tytul}, ${r.data}, ${r.imie} ${r.nazwisko} (${r.email})`
                ).join('\n');

                const blob = new Blob([tekst], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rezerwacje_${popupWydarzenie.title}_${popupWydarzenie.startStr}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                setPopupWydarzenie(null);
              }}>Eksportuj rezerwacje</button>{' '}

              <button onClick={() => {
                const potwierdzenie = window.confirm(`Czy na pewno chcesz usunąć wszystkie rezerwacje dla "${popupWydarzenie.title}"?`);
                if (potwierdzenie) {
                  const noweRezerwacje = rezerwacje.filter(r =>
                    !(r.tytul === popupWydarzenie.title && r.data === popupWydarzenie.startStr)
                  );
                  setRezerwacje(noweRezerwacje);
                  alert("Rezerwacje usunięte.");
                }
              }}>Usuń rezerwacje</button>{' '}

              <button onClick={() => {
                const nowyTytul = prompt("Nowy tytuł przedstawienia:", popupWydarzenie.title);
                const nowaGodzinaStart = prompt("Nowa godzina rozpoczęcia (np. 12:00):", popupWydarzenie.startStr.slice(11, 16));
                const nowaGodzinaKoniec = prompt("Nowa godzina zakończenia (np. 14:00):", popupWydarzenie.endStr.slice(11, 16));

                if (!nowyTytul || !nowaGodzinaStart || !nowaGodzinaKoniec) {
                  alert("Wszystkie pola muszą być wypełnione.");
                  return;
                }

                const start = `${popupWydarzenie.startStr.slice(0, 10)}T${nowaGodzinaStart}`;
                const end = `${popupWydarzenie.startStr.slice(0, 10)}T${nowaGodzinaKoniec}`;
                const startDate = new Date(start);
                const endDate = new Date(end);

                if (startDate.getTime() === endDate.getTime()) {
                  alert("Godzina rozpoczęcia i zakończenia nie mogą być takie same.");
                  return;
                } else if (startDate.getTime() > endDate.getTime()) {
                  alert("Godzina zakończenia nie może być wcześniejsza od rozpoczęcia.");
                  return;
                }

                const noweWydarzenia = wydarzenia.map(wyd => {
                  const czyToTo = (
                    wyd.title === popupWydarzenie.title &&
                    new Date(wyd.start).getTime() === popupWydarzenie.start.getTime()
                  );
                  return czyToTo ? { ...wyd, title: nowyTytul, start, end } : wyd;
                });

                setWydarzenia(noweWydarzenia);
                setPopupWydarzenie(null);
              }}>Edytuj wydarzenie</button>{' '}

              <button onClick={() => {
                const potwierdzenie = window.confirm(`Usunąć wydarzenie: "${popupWydarzenie.title}"?`);
                if (potwierdzenie) {
                  setWydarzenia(wydarzenia.filter(wyd => {
                    if (!wyd.start || !wyd.end) return true;
                    const startA = new Date(wyd.start).getTime();
                    const startB = popupWydarzenie.start.getTime();
                    return !(wyd.title === popupWydarzenie.title && startA === startB);
                  }));
                }
                setPopupWydarzenie(null);
              }}>Usuń wydarzenie</button>{' '}

              <button onClick={() => setPopupWydarzenie(null)}>Anuluj</button>
            </div>
          )}

          {popupInfo && (
            <div style={{
              position: 'fixed',
              top: '30%',
              left: '50%',
              color: 'black',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 1000
            }}>
              <p>Co chcesz zrobić dla dnia {popupInfo.dateStr}?</p>

              <button onClick={() => {
                const rezerwacjeDnia = rezerwacje.filter(r => r.data.startsWith(popupInfo.dateStr));
                if (rezerwacjeDnia.length === 0) {
                  alert("Brak rezerwacji na ten dzień.");
                  setPopupInfo(null);
                  return;
                }

                const tekst = rezerwacjeDnia.map(r =>
                  `• ${r.tytul}, ${r.data}, ${r.imie} ${r.nazwisko} (${r.email})`
                ).join('\n');

                const blob = new Blob([tekst], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rezerwacje_${popupInfo.dateStr}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                setPopupInfo(null);
              }}>Eksportuj rezerwacje</button>{' '}

              <button onClick={() => {
                kalendarzRef.current?.getApi().changeView('timeGridDay', popupInfo.date);
                setPopupInfo(null);
              }}>Wyświetl dzień</button>{' '}

              <button onClick={() => {
                const tytul = prompt("Tytuł przedstawienia:");
                const godzinaStart = prompt("Godzina rozpoczęcia:");
                const godzinaKoniec = prompt("Godzina zakończenia:");
                const startDate = new Date(`${popupInfo.dateStr}T${godzinaStart}`);
                const endDate = new Date(`${popupInfo.dateStr}T${godzinaKoniec}`);

                if (startDate.getTime() === endDate.getTime()) {
                  alert("Godzina rozpoczęcia i zakończenia nie mogą być takie same.");
                  setPopupInfo(null);
                  return;
                }
                else if (startDate.getTime() > endDate.getTime()) {
                  alert("Godzina zakończenia nie może być wcześniejsza od godziny rozpoczęcia.");
                  setPopupInfo(null);
                  return;
                }
                else if (!tytul || !godzinaStart || !godzinaKoniec) {
                  alert("Musisz podać tytuł oraz godziny rozpoczęcia i zakończenia.");
                  setPopupInfo(null);
                  return;
                }

                const start = `${popupInfo.dateStr}T${godzinaStart}`;
                const end = `${popupInfo.dateStr}T${godzinaKoniec}`;

                setWydarzenia([...wydarzenia, { title: tytul, start, end }]);
                setPopupInfo(null);
              }}>Dodaj wydarzenie</button>{' '}

              <button onClick={() => setPopupInfo(null)}>Anuluj</button>
            </div>
          )}


          <FullCalendar
            locales={[plLocale]}
            locale="pl"
            ref={kalendarzRef}
            firstDay={1}
            contentHeight="auto"
            dayCellContent={(arg) => (
              <div style={{ fontSize: '0.7rem', padding: '2px', color: 'white' }}>{arg.dayNumberText}</div>
            )}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
              
            }}

            dateClick={(info) => {
              if (!czyAdmin) {
                kalendarzRef.current?.getApi().changeView('timeGridDay', info.date);
                return;
              }
              setPopupInfo(info);
            }}

            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            events={wydarzenia}

            eventClick={(info) => {
              if (czyAdmin) {
                setPopupWydarzenie(info.event);
              } else {
                const teraz = new Date();
                const startPrzedstawienia = new Date(info.event.start);
                const koniecPrzedstawienia = new Date(info.event.end);
                const roznicaM1 = startPrzedstawienia.getTime() - teraz.getTime();
                const roznicaMinut = roznicaM1 / 1000 / 60;
                const dlugoscP1 = startPrzedstawienia.getTime() - koniecPrzedstawienia.getTime();
                const dlugoscPrzedstawienia = dlugoscP1 / 1000 / 60;

                if (roznicaMinut < 30 && roznicaMinut > 0) {
                  alert("Rezerwacja jest niedostępna - przedstawienie wkrótce się rozpocznie.");
                  return;
                }
                else if (roznicaMinut < 0 && roznicaMinut > dlugoscPrzedstawienia) {
                  alert("Rezerwacja jest niedostępna - przedstawienie już się rozpoczęło.");
                  return;
                }
                else if (roznicaMinut < dlugoscPrzedstawienia) {
                  alert("Rezerwacja jest niedostępna - przedstawienie już się zakończyło.");
                  return;
                }
                setWybraneWydarzenie({
                  tytul: info.event.title,
                  data: info.event.startStr
                });
              }
            }}

          />

        </div>
        <div style={{ padding: '2%' }}></div>
      </div>

    </div>
  );
}

export default TerminyPrzedstawien;