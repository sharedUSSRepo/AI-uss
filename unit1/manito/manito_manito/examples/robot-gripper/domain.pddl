(define (domain robot-gripper)
  (:requirements :strips :typing)
  
  (:types
    robot gripper object location - entity
  )

  (:predicates
    (at ?x - entity ?l - entity)
    (above ?x - entity ?y - entity)
    (empty ?r - robot)
    (holding ?r - robot ?o - object)
  )
  
  (:action pick
    :parameters (?r - robot ?o - object ?l - entity)
    :precondition (and 
      (at ?o ?l)
      (above ?r ?o)
      (empty ?r)
    )
    :effect (and 
      (not (at ?o ?l))
      (not (empty ?r))
      (not (above ?o ?l))
      (above ?o ?r)
      (holding ?r ?o)
    )
  )
  
  (:action drop
    :parameters (?r - robot ?o - object ?l - entity)
    :precondition (and 
      (at ?r ?l)
      (holding ?r ?o)
    )
    :effect (and 
      (at ?o ?l)
      (empty ?r)
      (not (holding ?r ?o))
      (not (above ?o ?r))
      (above ?o ?l)
    )
  )
  
  (:action move
    :parameters (?r - robot ?from - entity ?to - entity)
    :precondition (at ?r ?from)
    :effect (and 
      (at ?r ?to)
      (not (at ?r ?from))
      (above ?r ?to) 
      (not (above ?r ?from))
    )
  )
)
