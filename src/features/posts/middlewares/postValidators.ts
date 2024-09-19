import { body } from "express-validator";
import { inputCheckErrorsMiddleware } from "../../../global-middlewares/inputCheckErrorsMiddleware";
import { NextFunction, Request, Response } from "express";
import { adminMiddleware } from "../../../global-middlewares/admin-middleware";
import { blogsRepository } from "../../blogs/blogs.repository";
import { postsRepository } from "../posts.repository";

// title: string // max 30
// shortDescription: string // max 100
// content: string // max 1000
// blogId: string // valid

const postTitleInputValidator = body("title").isString().withMessage("not string").trim().isLength({ min: 1, max: 30 }).withMessage("no more than 30 symbols");
const postShortDescriptionInputValidator = body("shortDescription")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage("no more than 100 symbols");
const postContentInputValidator = body("content")
  .isString()
  .withMessage("not string")
  .trim()
  .isLength({ min: 1, max: 1000 })
  .withMessage("no more than 1000 symbols");

export const postInputValidators = [
  adminMiddleware,
  postTitleInputValidator,
  postShortDescriptionInputValidator,
  postContentInputValidator,
  //custom validator
  body("blogId").custom(async (blogId) => {
    const blog = await blogsRepository.find(blogId);
    if (!blog) {
      throw new Error("no blog!");
    }
  }),
  inputCheckErrorsMiddleware,
];

export const findPostValidator = (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const isPostExist = postsRepository.find(req.params.id);
  if (!isPostExist) {
    res.sendStatus(404);
    return;
  }
  next();
};