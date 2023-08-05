import axios from "axios";
import { useEffect, useState } from "react";
import StarComponent from "./Star";

const KEY = "fb9425e";
const endpoint = `http://www.omdbapi.com/?apikey=${KEY}`;
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(function () {
    const response = localStorage.getItem("watched");
    return response ? JSON.parse(response) : [];
  });
  const [movieSelected, setMovieSelected] = useState({
    imdbId: "",
    userRating: 0,
  });

  function handleMovieClick(imdbId) {
    setMovieSelected((elem) => {
      if (elem.imdbId === imdbId) return { imdbId: "", userRating: 0 };
      const movieAdded = watched.filter((key) => key.imdbID === imdbId);
      return {
        imdbId,
        userRating: movieAdded.length > 0 ? movieAdded[0].userRating : 0,
      };
    });
  }

  function handleAddMovie(movie) {
    setWatched((elem) => {
      if ([...elem.filter((key) => key.imdbID === movie.imdbID)].length === 0) {
        const watchedMovieList = [...elem, movie];

        localStorage.setItem("watched", JSON.stringify(watchedMovieList));
        return watchedMovieList;
      } else return elem;
    });
    handleMovieClick("");
  }

  useEffect(
    function () {
      async function getAllData() {
        try {
          const response = await axios.get(
            endpoint + `&s="interstellar"&limit=10`
          );
          if (response.data.Response === "True") {
            setMovies(response.data.Search);
          } else {
            console.log(response.data);
          }
        } catch (error) {
          console.log(error);
        }
      }
      getAllData();
    },
    [setMovies]
  );

  return (
    <>
      <NavBar movies={movies}>
        <MovieCounts movies={movies} />
      </NavBar>
      <Main>
        <Box>
          <MoviesList movies={movies} onMovieClick={handleMovieClick} />
        </Box>
        {movieSelected.imdbId === "" ? (
          <Box element={<ListWatchedMovie watched={watched} />}>
            <WatchedMovieSummary watched={watched} />
          </Box>
        ) : (
          <MoviesDetailsPage
            movieSelected={movieSelected}
            onAddMovie={handleAddMovie}
          />
        )}
      </Main>
    </>
  );
}

function MoviesDetailsPage({ movieSelected, onAddMovie }) {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  let ratingSelected = rating > 0;

  function handleMovieAdd() {
    if (rating <= 0) return;
    const movieObj = {
      imdbID: selectedMovie.imdbID,
      Poster: selectedMovie.Poster,
      Title: selectedMovie.Title,
      imdbRating: selectedMovie.imdbRating,
      runtime: selectedMovie.Runtime ? selectedMovie.Runtime.split(" ")[0] : "",
      userRating: rating,
    };
    onAddMovie(movieObj);
  }

  function handleRatingSelection(rating) {
    setRating(rating);
    ratingSelected = rating > 0;
  }

  useEffect(
    function () {
      setRating(movieSelected.userRating);
      if (movieSelected.userRating > 0) setRated(true);
      else setRated(false);

      async function getSelectedMovieDetails() {
        const response = await axios.get(
          endpoint + `&i=${movieSelected.imdbId}`
        );
        if (response.data.Response === "True") {
          setSelectedMovie(response.data);
        }
      }
      getSelectedMovieDetails();
    },
    [movieSelected, setSelectedMovie]
  );

  return (
    <Box>
      {selectedMovie !== {} && (
        <div className="details">
          <header>
            <img src={selectedMovie.Poster} />
            <div className="details-overview">
              <h2>{selectedMovie.Title}</h2>
              <p>
                {selectedMovie.Released} &bull; {selectedMovie.Runtime}
              </p>
              <p> {selectedMovie.Genre}</p>
              <p> &#11088; {selectedMovie.imdbRating} IMDB rated</p>
            </div>
          </header>

          <section>
            {rated && <p> You have rated this movie with {rating} &#11088;</p>}
            {!rated && (
              <>
                <StarComponent
                  maxRating={10}
                  rating={rating}
                  onSetRating={handleRatingSelection}
                  size={20}
                />
                {ratingSelected && (
                  <button className="btn-add" onClick={handleMovieAdd}>
                    + Add to watch-list
                  </button>
                )}
              </>
            )}
            <p>
              <em>{selectedMovie.Plot}</em>
            </p>
            <p>
              Starring <em>{selectedMovie.Actors}</em>
            </p>
            <p>
              Directed By <em>{selectedMovie.Director}</em>
            </p>
          </section>
        </div>
      )}
    </Box>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      <QuerySearch />
      {children}
    </nav>
  );
}

function MovieCounts({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function QuerySearch() {
  const [query, setQuery] = useState("");
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ element, children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
      {element}
    </div>
  );
}

function MoviesList({ movies, onMovieClick }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movies movie={movie} key={movie.imdbID} onMovieClick={onMovieClick} />
      ))}
    </ul>
  );
}

function Movies({ movie, onMovieClick }) {
  return (
    <li key={movie.imdbID} onClick={() => onMovieClick(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function ListWatchedMovie({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMovieSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating || 0)
  ).toFixed("2");
  const avgUserRating = average(
    watched.map((movie) => movie.userRating || 0)
  ).toFixed("2");
  const avgRuntime = average(
    watched.map((movie) => movie.runtime || 0)
  ).toFixed("2");

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
