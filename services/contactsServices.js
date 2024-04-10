import Contact from "../models/Contact.js";

export const listContacts = (filter = {}, option = {}) =>
  Contact.find(filter, null, option);

export const addContact = (data) => Contact.create(data);

export const getOneContact = (filter) => Contact.findOne(filter);

export const removeOneContact = (filter) => Contact.findOneAndDelete(filter);

export const updateOneContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);
