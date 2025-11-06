import bcrypt from "bcrypt";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Delete existing data
  await knex("notes").del();
  await knex("users").del();

  // Hash passwords
  const password1 = await bcrypt.hash("Test1234!", 10);
  const password2 = await bcrypt.hash("Demo1234!", 10);

  // Add users
  const [user1, user2] = await knex("users")
    .insert([
      { username: "demouser", password: password1 },
      { username: "testuser", password: password2 },
    ])
    .returning("*");

  // Add sample notes
  await knex("notes").insert([
    {
      title: "Witaj w aplikacji!",
      content: "To jest twoja pierwsza notatka. Możesz ją edytować lub usunąć.",
      user_id: user1.id,
    },
    {
      title: "Lista zakupów",
      content: "Mleko, chleb, masło, jajka",
      user_id: user1.id,
    },
    {
      title: "Pomysły na projekt",
      content: "1. Dodać edycję notatek\n2. Dark mode\n3. Kategoryzacja",
      user_id: user1.id,
    },
    {
      title: "Notatka testowa",
      content: "Testowa treść dla drugiego użytkownika",
      user_id: user2.id,
    },
  ]);
}
