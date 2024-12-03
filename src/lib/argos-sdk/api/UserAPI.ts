import { User } from "../types/User";

export class UserAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async updateUserTags(fingerprint: string, tags: string[]): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${fingerprint}/tags`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user tags");
    }

    return response.json();
  }
}
