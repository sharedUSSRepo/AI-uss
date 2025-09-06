(define (problem robot-gripper-problem)
  (:domain robot-gripper)
  
  (:objects
    robot1 - robot
    gripper1 - gripper
    redCube - object
    blueCube - object
    table box - location
  )
  
  (:init
    (at robot1 table)
    (at redCube table)
    (empty robot1)
    (attached gripper1 robot1)
  )
  
  (:goal
    (holding robot1 redCube)
  )
)
