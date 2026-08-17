import { useEffect, useState, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { token, user } = useAuth();

  /* =========================================================
     PROFILE DATA
     ========================================================= */

  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");

  const [position, setPosition] = useState("");
  const [organization, setOrganization] = useState("");
  const [department, setDepartment] = useState("");
  const [teamLead, setTeamLead] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [startedAt, setStartedAt] = useState("");

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [languages, setLanguages] = useState("");
  const [programmingLanguages, setProgrammingLanguages] =
    useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] =
    useState("");

  const [driverLicense, setDriverLicense] =
    useState(false);


  /* =========================================================
     AVATAR / CROP STATE
     ========================================================= */

  const [showMenu, setShowMenu] = useState(false);
  const [showCrop, setShowCrop] = useState(false);

  /*
   * OVO SU VREDNOSTI KOJE SE ČUVAJU U BAZI.
   *
   * Originalna slika ostaje cela.
   *
   * offset = pozicija slike
   * scale  = zoom slike
   */

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  });

  const [scale, setScale] = useState(1);

  const [dragging, setDragging] =
    useState(false);

  const startPosRef = useRef({
    x: 0,
    y: 0,
  });

  const fileInputRef = useRef(null);


  /* =========================================================
     UČITAVANJE PROFILA
     ========================================================= */

  useEffect(() => {
    if (!token) return;

    fetch(
      "http://localhost:3000/user-profiles/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            "Greška pri učitavanju profila"
          );
        }

        return res.json();
      })
      .then((data) => {
        if (!data) return;

        setBio(data.bio || "");

        setProfilePic(
          data.profilePic || null
        );

        setPosition(
          data.position || ""
        );

        setOrganization(
          data.organization || ""
        );

        setDepartment(
          data.department || ""
        );

        setTeamLead(
          data.teamLead || ""
        );

        setWorkPhone(
          data.workPhone || ""
        );

        setStartedAt(
          data.startedAt
            ? data.startedAt.split("T")[0]
            : ""
        );

        setCountry(
          data.country || ""
        );

        setCity(
          data.city || ""
        );

        setAddress(
          data.address || ""
        );

        setLanguages(
          data.languages || ""
        );

        setProgrammingLanguages(
          data.programmingLanguages || ""
        );

        setSkills(
          data.skills || ""
        );

        setCertifications(
          data.certifications || ""
        );

        setDriverLicense(
          data.driverLicense || false
        );


        /*
         * NAJBITNIJI DEO
         *
         * Učitavamo prethodno sačuvanu
         * poziciju i zoom slike.
         */

        setOffset({
          x:
            typeof data.offset?.x ===
            "number"
              ? data.offset.x
              : 0,

          y:
            typeof data.offset?.y ===
            "number"
              ? data.offset.y
              : 0,
        });


        setScale(
          typeof data.scale === "number"
            ? data.scale
            : 1
        );
      })
      .catch((err) => {
        console.error(
          "Greška:",
          err
        );
      });
  }, [token]);


  /* =========================================================
     ČUVANJE OSTALIH PODATAKA
     ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "http://localhost:3000/user-profiles/me",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            bio,

            profilePic,

            position,
            organization,
            department,
            teamLead,
            workPhone,
            startedAt,

            country,
            city,
            address,

            languages,
            programmingLanguages,
            skills,
            certifications,

            driverLicense,

            /*
             * ČUVAMO I POZICIJU AVATARA
             */

            offset,
            scale,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(
          "Profil uspešno ažuriran ✅"
        );
      } else {
        setMessage(
          data.message ||
            "Greška ❌"
        );
      }
    } catch (err) {
      console.error(err);

      setMessage(
        "Greška prilikom čuvanja profila ❌"
      );
    }
  };


  /* =========================================================
     DRAG - POČETAK
     ========================================================= */

  const startDrag = (e) => {
    e.preventDefault();

    setDragging(true);

    startPosRef.current = {
      x:
        e.clientX -
        offset.x,

      y:
        e.clientY -
        offset.y,
    };
  };


  /* =========================================================
     DRAG - POMERANJE
     ========================================================= */

  const onDrag = (e) => {
    if (!dragging) return;

    setOffset({
      x:
        e.clientX -
        startPosRef.current.x,

      y:
        e.clientY -
        startPosRef.current.y,
    });
  };


  /* =========================================================
     DRAG - KRAJ
     ========================================================= */

  const endDrag = () => {
    setDragging(false);
  };


  /* =========================================================
     TOUCH DRAG
     ========================================================= */

  const startTouchDrag = (e) => {
    const touch =
      e.touches[0];

    setDragging(true);

    startPosRef.current = {
      x:
        touch.clientX -
        offset.x,

      y:
        touch.clientY -
        offset.y,
    };
  };


  const onTouchDrag = (e) => {
    if (!dragging) return;

    const touch =
      e.touches[0];

    setOffset({
      x:
        touch.clientX -
        startPosRef.current.x,

      y:
        touch.clientY -
        startPosRef.current.y,
    });
  };


  /* =========================================================
     IZBOR NOVE SLIKE
     ========================================================= */

  const handleImageSelect = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;


    /*
     * Provera da li je stvarno slika
     */

    if (!file.type.startsWith("image/")) {
      setMessage(
        "Izabrani fajl nije slika ❌"
      );

      return;
    }


    const reader =
      new FileReader();


    reader.onloadend = () => {

      /*
       * Originalna slika se čuva.
       * NE CROP-UJEMO JE.
       */

      setProfilePic(
        reader.result
      );


      /*
       * Nova slika počinje
       * od početne pozicije.
       */

      setOffset({
        x: 0,
        y: 0,
      });


      setScale(1);


      /*
       * Otvori editor.
       */

      setShowCrop(true);
    };


    reader.readAsDataURL(file);


    /*
     * Omogućava ponovno biranje
     * istog fajla.
     */

    e.target.value = "";
  };


  /* =========================================================
     OTVARANJE FILE PICKER-A
     ========================================================= */

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };


  /* =========================================================
     ČUVANJE POZICIJE SLIKE
     ========================================================= */

  const saveAvatarChanges = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/user-profiles/me",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          /*
           * NE ŠALJEMO NOVU CROPOVANU SLIKU.
           *
           * Šaljemo originalnu sliku +
           * poziciju + zoom.
           */

          body: JSON.stringify({
            profilePic,
            offset,
            scale,
          }),
        }
      );


      const data =
        await res.json();


      if (res.ok) {

        setMessage(
          "Pozicija profilne slike sačuvana ✅"
        );

        setShowCrop(false);

      } else {

        setMessage(
          data.message ||
            "Greška ❌"
        );
      }

    } catch (err) {

      console.error(err);

      setMessage(
        "Greška prilikom čuvanja slike ❌"
      );
    }
  };


  /* =========================================================
     LOADING
     ========================================================= */

  if (!user) {
    return (
      <div className="profile-container">
        Učitavanje...
      </div>
    );
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="profile-container">

      <div className="profile-card">


        {/* =================================================
            HEADER
            ================================================= */}

        <div className="profile-header">


          {/* AVATAR */}

          <div
            className="profile-avatar"
            onClick={() =>
              setShowMenu(true)
            }
          >

            {profilePic ? (

              <div className="avatar-image-wrapper">

                <img
                  src={profilePic}
                  alt="avatar"
                  className="avatar-img"

                  draggable={false}

                  style={{
                    transform: `
                      translate(
                        ${offset.x}px,
                        ${offset.y}px
                      )
                      scale(${scale})
                    `,

                    transformOrigin:
                      "top left",
                  }}
                />

              </div>

            ) : (

              user.username
                ?.charAt(0)
                .toUpperCase()

            )}

          </div>


          {/* USER INFO */}

          <div>

            <h2>
              {user.username}
            </h2>

            <p className="profile-email">
              {user.email}
            </p>

          </div>

        </div>


        {/* =================================================
            FILE INPUT
            ================================================= */}

        <input
          ref={fileInputRef}

          type="file"

          accept="image/*"

          style={{
            display: "none",
          }}

          onChange={
            handleImageSelect
          }
        />


        {/* =================================================
            FORM
            ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="profile-form"
        >


          <h3>
            Work
          </h3>


          <input
            type="text"
            placeholder="Position"
            value={position}
            onChange={(e) =>
              setPosition(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Organization"
            value={organization}
            onChange={(e) =>
              setOrganization(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(e) =>
              setDepartment(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Team Lead"
            value={teamLead}
            onChange={(e) =>
              setTeamLead(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Work Phone"
            value={workPhone}
            onChange={(e) =>
              setWorkPhone(
                e.target.value
              )
            }
          />


          <input
            type="date"
            value={startedAt}
            onChange={(e) =>
              setStartedAt(
                e.target.value
              )
            }
          />


          <h3>
            Location
          </h3>


          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) =>
              setCity(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
          />


          <h3>
            Expertise
          </h3>


          <input
            type="text"
            placeholder="Languages"
            value={languages}
            onChange={(e) =>
              setLanguages(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Programming Languages"
            value={programmingLanguages}
            onChange={(e) =>
              setProgrammingLanguages(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Skills"
            value={skills}
            onChange={(e) =>
              setSkills(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Certifications"
            value={certifications}
            onChange={(e) =>
              setCertifications(
                e.target.value
              )
            }
          />


          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={driverLicense}
              onChange={(e) =>
                setDriverLicense(
                  e.target.checked
                )
              }
            />

            Driver License

          </label>


          <h3>
            Bio
          </h3>


          <textarea
            value={bio}
            onChange={(e) =>
              setBio(
                e.target.value
              )
            }

            placeholder="Napiši nešto o sebi..."
          />


          <button type="submit">
            Sačuvaj izmene
          </button>

        </form>


        {message && (

          <p className="profile-message">
            {message}
          </p>

        )}

      </div>


      {/* =================================================
          AVATAR MENU
          ================================================= */}

      {showMenu && (

        <div
          className="avatar-modal"

          onClick={() =>
            setShowMenu(false)
          }
        >

          <div
            className="avatar-menu"

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              onClick={() => {
                openFilePicker();
                setShowMenu(false);
              }}
            >

              {profilePic
                ? "Promeni sliku"
                : "Dodaj sliku"}

            </button>


            {profilePic && (

              <button
                onClick={() => {
                  setShowCrop(true);
                  setShowMenu(false);
                }}
              >
                Podesi poziciju slike
              </button>

            )}


            <button
              className="cancel-btn"

              onClick={() =>
                setShowMenu(false)
              }
            >
              Otkaži
            </button>

          </div>

        </div>

      )}


      {/* =================================================
          CROP / POSITION EDITOR
          ================================================= */}

      {showCrop && profilePic && (

        <div className="avatar-modal">

          <div className="avatar-modal-content">


            <h3>
              Namesti profilnu sliku
            </h3>


            <p className="crop-help">
              Prevuci sliku da je namestiš
              i koristi klizač za zoom.
            </p>


            <div
              className="crop-container"

              onMouseDown={
                startDrag
              }

              onMouseMove={
                onDrag
              }

              onMouseUp={
                endDrag
              }

              onMouseLeave={
                endDrag
              }

              onTouchStart={
                startTouchDrag
              }

              onTouchMove={
                onTouchDrag
              }

              onTouchEnd={
                endDrag
              }
            >

              <img
                src={profilePic}

                alt="crop"

                className="crop-image"

                draggable={false}

                style={{
                  transform: `
                    translate(
                      ${offset.x}px,
                      ${offset.y}px
                    )
                    scale(${scale})
                  `,

                  transformOrigin:
                    "top left",
                }}
              />


              <div className="crop-circle" />

            </div>


            <div className="zoom-label">
              Zoom: {scale.toFixed(2)}x
            </div>


            <input
              type="range"

              min="0.1"

              max="3"

              step="0.01"

              value={scale}

              onChange={(e) =>
                setScale(
                  Number(
                    e.target.value
                  )
                )
              }
            />


            <div className="crop-buttons">

              <button
                type="button"

                onClick={
                  saveAvatarChanges
                }
              >
                Sačuvaj
              </button>


              <button
                type="button"

                className="cancel-btn"

                onClick={() =>
                  setShowCrop(false)
                }
              >
                Otkaži
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}