// src/pages/About.jsx
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="flex-1 px-6 py-10 flex justify-center">
        <div className="max-w-4xl w-full space-y-6">
          <h1 className="text-5xl font-emerald tracking-tight mb-1">
            ~ How~Doggerz~Works ~

          </h1>
          <br></br>
          <br></br>
          <p className="text-md text-zinc-400">
            Doggerz is your realistic virtual dog.<br></br>
            <br></br>Their stats, temperament, and behavior are based
            on the choices you make.<br></br>
            Even while you are gone!
          </p>

          <section className="space-y-2 text-md text-zinc-400">
            <h2 className="font-semibold text-zinc-100">Core loop</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Play together, Learn together.</li>
              <li>Bathe regularly to avoid fleas, mange, and disease!</li>
              <li>Your dog <b>will</b> auto-sleep when tired; let them sleep..</li>
              <li>
                Be sure to let them outside regularly to get them potty trained to avoid messy  “accidents”.
              </li>
            </ul>
          </section>

          <section className="space-y-2 text-md text-zinc-400">
            <h2 className="font-semibold text-zinc-100">Aging &amp; life</h2>
            <p>
              Time in Doggerz is <b>accelerated:</b> Your dog ages <b>faster</b> than real time.
              With good care they can live a long, happy life!<br></br> But Ignoring them for
              days has consequences — hunger, poor cleanliness, and low health can
              eventually lead to death.
            </p>
          </section>

          <section className="space-y-2 text-md text-zinc-400">
            <h2 className="font-semibold text-zinc-100">Potty training</h2>
            <p>
              Every successful potty trip outside raises their potty-training
              meter. Once it hits 100%, they earn a potty-trained badge and indoor
              accidents become rare.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
