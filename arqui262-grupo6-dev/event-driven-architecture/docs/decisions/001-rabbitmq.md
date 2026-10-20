# ADR 001 - RabbitMQ como broker de la demo

- Estado: aceptada
- Contexto: se necesita un broker que haga visibles exchange, bindings, colas, ACK y DLQ en pocos minutos.
- Decisión: usar RabbitMQ (imagen oficial con management UI) con un exchange `topic` durable y una cola por suscriptor.
- Por qué: la UI muestra `Ready`, `Unacked` y `Consumers` en vivo; ACK manual, TTL y dead-lettering vienen de fábrica.
- Consecuencias: el broker elimina el mensaje al ACK; no hay replay histórico.
- Alternativa: Kafka sería más apropiado para streaming durable, replay y alto throughput, pero no es necesario
  para demostrar estos patrones y añadiría complejidad operativa que distrae de la explicación.
