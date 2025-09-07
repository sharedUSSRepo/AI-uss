(define (problem robot-gripper-problem)
  (:domain robot-gripper)
  
  (:objects
    manito - robot
    redCube - object
    blueCube - object
    table - location
  )

  (:init
    (above redCube table)
    (above blueCube table)
    (above manito table)
    (at redCube table)
    (at blueCube table)
    (at manito table)
    (empty manito)
  )
  
  (:goal
    (above blueCube redCube)
  )
)
