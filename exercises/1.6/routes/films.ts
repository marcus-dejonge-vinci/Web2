import { Router } from "express";
import { Film } from "../types";
import { newFilm } from "../types";

const films: Film[] = [
    {
        id: 1,
        title: "L'Odyssée Interstellaire",
        director: "Christopher Nolan",
        duration: 169,
        budget: 165,
        description: "Un groupe d'astronautes voyage à travers un trou de ver à la recherche d'une nouvelle maison pour l'humanité.",
        imageUrl: "https://example.com/interstellar.jpg"
    },
    {
        id: 2,
        title: "Le Maître des Anneaux : La Communauté de l'Anneau",
        director: "Peter Jackson",
        duration: 178,
        budget: 93,
        description: "Le début de l'épopée fantastique où Frodon et ses amis se lancent dans une quête pour détruire l'Anneau Unique.",
        imageUrl: "https://example.com/lotr_fellowship.jpg"
    },
    {
        id: 3,
        title: "Le Voyage Fantastique",
        director: "Hayao Miyazaki",
        duration: 125,
        budget: 19.2,
        description: "Une jeune fille se retrouve piégée dans un monde spirituel étrange après avoir emménagé dans une nouvelle maison.",
        imageUrl: "https://example.com/spirited_away.jpg"
    }
];

const router = Router();

let requestCount=0;

router.use((_req, _res, next) => {
    if(_req.method === 'GET'){
        requestCount++;
    }   
    console.log("Get counter : "+ requestCount); 
  next();
});

router.get("/", (req, res) => {
    if (!("minimum-duration" in req.query) || typeof req.query["minimum-duration"] !== "string") {
      return res.json(films);
    }  
    
    const minDurationString: string = req.query["minimum-duration"];

    const minDuration = Number.parseInt(minDurationString);

    console.log("minDuration : "+ minDuration);
    

    const filteredMovies = films.filter((film) => {
      return film.duration > minDuration;
    });
    return res.json(filteredMovies);
  });

  router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const film = films.find((film) => film.id === id);
    if (!film) {
      return res.sendStatus(404).json({ error: "Film not found" });
    }
    return res.json(film);
  });

  router.post("/", (req, res) => {
    const body = req.body as Partial<newFilm>;

    if(
        !body ||
        typeof body.title !== 'string' ||
        typeof body.director !== 'string' ||
        typeof body.duration !== 'number' ||
        !body.title.trim() ||
        !body.director.trim() ||
        body.duration <= 0 
    ) {
        return res.sendStatus(400).json({error: "Invalid film data"});
    }

    const {title, director, duration, budget, description, imageUrl} = body;

    const nextId =
    films.reduce((maxId, film) => (film.id > maxId ? film.id : maxId), 0) + 1;

    const newFilm: Film = {
        id: nextId,
        title,
        director,
        duration,
        budget,
        description,
        imageUrl
    };

    for (const film of films) {
        if (film.title === title && film.director === director) {
          return res.status(409).json({ error: "Film already exists" });
        }
    }

    films.push(newFilm);
    return res.status(201).json(newFilm);
  });

  router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const filmIndex = films.findIndex((film) => film.id === id);
    if (filmIndex === -1) {
      return res.sendStatus(404).json({ error: "Film not found" });
    }
    films.splice(filmIndex, 1);
    return res.sendStatus(204);
  });

  router.patch("/:id", (req, res) => {
    const id = Number(req.params.id);
    const film = films.find((film) => film.id === id);
    if(!film){
        return res.sendStatus(404).json({error: "Film not found"});
    }

    const body: unknown = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      ("title" in body &&
        (typeof body.title !== "string" || !body.title.trim())) ||
      ("image" in body &&
        (typeof body.image !== "string" || !body.image.trim())) ||
      ("volume" in body &&
        (typeof body.volume !== "number" || body.volume <= 0)) ||
      ("price" in body && (typeof body.price !== "number" || body.price <= 0))
    ) {
      return res.sendStatus(400).json({ error: "Bad request" });
    }

    const { title, director, duration, budget, description, imageUrl } = body as Partial<newFilm>;

    if(title){
        film.title = title;
    }
    if(director){
        film.director = director;
    }
    if(duration){
        film.duration = duration;
    }
    if(budget){
        film.budget = budget;
    }
    if(description){
        film.description = description;
    }
    if(imageUrl){
        film.imageUrl = imageUrl;
    }

    return res.json(film);
  });

export default router;