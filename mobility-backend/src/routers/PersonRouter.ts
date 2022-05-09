import express, { Router } from 'express';
import MobilityEntryController from '../controllers/MobilityEntryController';

import PersonController from '../controllers/PersonController';
import PersonInNeedController from '../controllers/PersonInNeedController';
import convertMobilityEntries from '../lib/convertMobilityEntries';
import convertPerson from '../lib/convertPerson';
import { PersonDAO, PersonDTO, PersonId } from '../types/Person';

const personController = new PersonController();
const personInNeedController = new PersonInNeedController();
const mobilityEntryController = new MobilityEntryController();

export const externalRouter = Router();

externalRouter.use(express.json());

/**
 * @api {POST} /
 * Add a Person
 *
 * @apiBody {PersonDTO} Person to add
 *
 * @apiSuccess {PersonId} Id of added Person
 **/
externalRouter.post('/', async (req, res) => {
  const person: PersonDTO = req.body;
    let personId: PersonId;
  console.log(person)
  if (person.hasOwnProperty('personId')) {
      console.log("found ad update")
      personId = person["personId"];
      await personController.update(person);
  } else {
      personId = await personController.post(person);
  }

  try {
    const personsInNeed = person.personsInNeed;

    if (personsInNeed && personsInNeed.length) {
      for (let i = 0; i < personsInNeed.length; i++) {
        await personInNeedController.post({ ...personsInNeed[i], personId });
      }
    }

    res.status(200).json({ personId });
  } catch (error) {
    console.error(error);

    // Rollback if person has already been inserted
    if (personId) {
      await personController.delete(personId);
    }
    res.sendStatus(500);
  }
});

export const internalRouter = Router();

internalRouter.use(express.json());

/**
 * @api {GET} /
 * Get all Persons
 *
 * @apiSuccess {PersonDTO[]} All Persons
 **/
internalRouter.get('/', async (_, res) => {
  const persons: PersonDAO[] = await personController.get();

  res.json(
    await Promise.all(
      persons.map(async (person) => {
        const persons_in_need = await personInNeedController.get(
          person.person_id
        );
        const personDTO = convertPerson(person, persons_in_need);

        const mobilityEntries = await convertMobilityEntries(
          await mobilityEntryController.get(personDTO.personId)
        );
        return { ...personDTO, mobilityEntries };
      })
    )
  );
});

/**
 * @api {GET} /delete
 * Delete a Person
 *
 * @apiParam {PersonId} Id of Person to delete
 *
 * @apiSuccess {HTTPStatusCode} 200
 **/
internalRouter.get('/delete/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    if (!personId || isNaN(Number(personId))) {
      res.sendStatus(400);
      return;
    }
    await personController.delete(Number(req.params.entryId));
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
