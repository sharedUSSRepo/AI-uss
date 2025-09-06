(define (problem impossible-robot-gripper-problem)
  (:domain impossible-robot-gripper)
  
  (:objects
    robot1 - robot
    gripper1 - gripper
    ball - object
    table box vault - location
  )
  
  (:init
    (at robot1 table)
    (at ball vault)
    (empty robot1)
    (attached gripper1 robot1)
    (accessible table)
    (accessible box)
  )
  
  (:goal
    (at ball box)
  )
)