<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }
    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'superadmin@apexlms.test',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'user' => ['uuid', 'email', 'full_name', 'roles', 'permissions'],
                ],
            ]);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'superadmin@apexlms.test',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_public_certificate_verification(): void
    {
        $response = $this->getJson('/api/v1/public/verify-certificate/APX-CCNA-98234');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_valid' => true,
                    'verification_code' => 'APX-CCNA-98234',
                ],
            ]);
    }
}
