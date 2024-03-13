const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const Project = require('../models/Project');
const { body, validationResult } = require('express-validator');


// route  1 ; all project fetch
router.get('/fetchallproject', authorize(['SuperAdmin', 'Admin', 'Client']), async (req, res) => {
    try {
        const project = await Project.find({ user: req.user.id });
        res.json(project)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some internal server error occured ");


    }
}
)

// route  2 ; add project 
router.post('/addproject', authorize(['SuperAdmin', 'Admin']), [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be 5 characters').isLength({ min: 5 }),
    body('tag'),
], async (req, res) => {
    try {


        const { title, description, tag } = req.body;
        //for error if then return bad req
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const project = new Project({
            title, description, tag, user: req.user.id
        })
        const savedProject = await project.save()
        res.json(savedProject)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some internal server error occured ");


    }

})
//ROUTE 3 : update a Project 
router.put('/updateproject/:id', authorize(['SuperAdmin', 'Admin']), async (req, res) => {
    const { title, description, tag } = req.body;
    // creat new Project
    const newProject={};
    if(title){newProject.title=title};
    if(description){newProject.description=description};
    if(tag){newProject.tag=tag};
    //find Project
    let project=await Project.findById(req.params.id);
    if(!project){res.status(404).send("not found")}

    //allow to user for his project
    if(project.user.toString()!==req.user.id){
        return res.status(401).send("not allowed");
    }
    project=await Project.findByIdAndUpdate(req.params.id,{$set: newProject},{new:true})
   res.json({project});
})
//ROUTE 4 : delete a project 
router.delete('/deleteproject/:id', authorize(['SuperAdmin']), async (req, res) => {
    const { title, description, tag } = req.body;
    // creat new project
    const newNote={};
    
    //find project
    let project=await Project.findById(req.params.id);
    if(!project){res.status(404).send("not found")}

    //allow to user for his project
    if(project.user.toString()!==req.user.id){
        return res.status(401).send("not allowed");
    }
    project=await Project.findByIdAndDelete(req.params.id)
     res.json({"Success": "project is successfully delete"});
})

module.exports = router