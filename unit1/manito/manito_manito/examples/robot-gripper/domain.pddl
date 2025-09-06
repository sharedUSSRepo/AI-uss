(define (domain robot-gripper)
  (:requirements :strips :typing)
  
  (:types
    robot gripper object location - entity
  )
  
  (:predicates
    (at ?x - entity ?l - location)
    (atObject ?x - entity ?o - object)
    (upObject ?r - robot ?o - object)
    (holding ?r - robot ?o - object)
    (empty ?r - robot)
    (attached ?g - gripper ?r - robot)
  )
  
  (:action pick
    :parameters (?r - robot ?o - object ?l - location ?o - object)
    :precondition (and 
      (upObject ?r ?o)
      (at ?o ?l)
      (empty ?r)
    )
    :effect (and 
      (holding ?r ?o)
      (not (at ?o ?l))
      (not (empty ?r))
    )
  )
  
  (:action drop
    :parameters (?r - robot ?o - object ?l - location)
    :precondition (and 
      (at ?r ?l)
      (holding ?r ?o)
    )
    :effect (and 
      (at ?o ?l)
      (empty ?r)
      (not (holding ?r ?o))
    )
  )
  
  (:action move
    :parameters (?r - robot ?from - location ?to - location)
    :precondition (at ?r ?from)
    :effect (and 
      (at ?r ?to)
      (not (at ?r ?from))
    )
  )

  (:action moveToObject
    :parameters (?r - robot ?from - location ?to - object)
    :precondition (at ?r ?from)
    :effect (and 
      (atObject ?r ?to)
      (not (atObject ?r ?from))
    )
  )
)
