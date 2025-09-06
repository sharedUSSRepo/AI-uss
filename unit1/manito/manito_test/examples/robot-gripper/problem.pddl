(define (problem robot-gripper-problem)
  (:domain robot-gripper)
  
  (:objects
    robot1 - robot
    gripper1 - gripper
    ball - object
    table box - location
  )
  
  (:init
    (at robot1 table)
    (at ball table)
    (empty robot1)
    (attached gripper1 robot1)
  )
  
  (:goal
    (at ball box)
  )
)
