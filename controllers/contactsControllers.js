import * as contactsService from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";
import { ctrWrapper } from "../helpers/ctrWrapper.js";

export const getAllContacts = ctrWrapper(async (req, res) => {
  const { _id: owner } = req.user;

  const { page = 1, limit = 20, favorite } = req.query;

  const skip = (page - 1) * limit;

  const filter = { owner };

  if (favorite) {
    filter.favorite = favorite;
  }
  const result = await contactsService.listContacts(filter, { skip, limit });
  res.json(result);
});

export const getOneContact = ctrWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.getOneContact({ _id: id, owner });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
});

export const deleteContact = ctrWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.removeOneContact({ _id: id, owner });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
});

export const createContact = ctrWrapper(async (req, res) => {
  const { _id: owner } = req.user;

  const result = await contactsService.addContact({ ...req.body, owner });
  res.status(201).json(result);
});

export const updateContact = ctrWrapper(async (req, res) => {
  const { id } = req.params;

  const { _id: owner } = req.user;

  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "Body must have at least one field");
  }

  const result = await contactsService.updateOneContact(
    { _id: id, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
});

export const updateStatusContact = ctrWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  if (
    !Object.keys(req.body).includes("favorite") ||
    Object.keys(req.body).length !== 1
  ) {
    throw HttpError(400, "Body must have only favorite field");
  }

  const result = await contactsService.updateOneContact(
    { _id: id, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
});
